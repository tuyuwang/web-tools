'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, TrendingUp, Coffee } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useLanguage } from '@/components/language-provider';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  workDuration: number; // 工作时长（分钟）
  shortBreakDuration: number; // 短休息时长（分钟）
  longBreakDuration: number; // 长休息时长（分钟）
  longBreakInterval: number; // 长休息间隔（几个番茄后）
  autoStartBreaks: boolean; // 自动开始休息
  autoStartWork: boolean; // 自动开始工作
}

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartWork: false,
};

interface PomodoroStats {
  completedPomodoros: number;
  totalWorkTime: number; // 总工作时间（分钟）
  totalBreakTime: number; // 总休息时间（分钟）
  date: string;
}

export default function PomodoroPage() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(defaultSettings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [stats, setStats] = useState<PomodoroStats>({
    completedPomodoros: 0,
    totalWorkTime: 0,
    totalBreakTime: 0,
    date: new Date().toDateString(),
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 获取当前模式的时长
  const getCurrentModeDuration = () => {
    switch (mode) {
      case 'work':
        return settings.workDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
      default:
        return settings.workDuration * 60;
    }
  };

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取进度百分比
  const getProgress = () => {
    const totalTime = getCurrentModeDuration();
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  // 播放提示音
  const playNotificationSound = () => {
    try {
      // 创建一个简单的提示音
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // 显示浏览器通知
  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  // 请求通知权限
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  // 计时器完成处理
  const handleTimerComplete = () => {
    playNotificationSound();
    
    if (mode === 'work') {
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);
      
      // 更新统计数据
      setStats(prev => ({
        ...prev,
        completedPomodoros: prev.completedPomodoros + 1,
        totalWorkTime: prev.totalWorkTime + settings.workDuration,
      }));
      
      showNotification('工作时间结束！', '好样的！是时候休息一下了。');
      
      // 决定下一个模式
      const nextMode = newCompletedPomodoros % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(nextMode === 'longBreak' ? settings.longBreakDuration * 60 : settings.shortBreakDuration * 60);
      
      if (settings.autoStartBreaks) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    } else {
      // 休息结束
      setStats(prev => ({
        ...prev,
        totalBreakTime: prev.totalBreakTime + (mode === 'longBreak' ? settings.longBreakDuration : settings.shortBreakDuration),
      }));
      
      showNotification('休息时间结束！', '准备好开始下一个番茄时间了吗？');
      setMode('work');
      setTimeLeft(settings.workDuration * 60);
      
      if (settings.autoStartWork) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    }
  };

  // 计时器逻辑
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // 初始化时请求通知权限
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // 开始/暂停计时器
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // 重置计时器
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getCurrentModeDuration());
  };

  // 切换模式
  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? settings.workDuration * 60 : 
                newMode === 'shortBreak' ? settings.shortBreakDuration * 60 : 
                settings.longBreakDuration * 60);
  };

  // 保存设置
  const saveSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
    // 如果当前在工作模式且计时器已重置，更新时间
    if (!isRunning && timeLeft === getCurrentModeDuration()) {
      setTimeLeft(newSettings.workDuration * 60);
    }
  };

  const getModeText = () => {
    switch (mode) {
      case 'work':
        return '专注工作';
      case 'shortBreak':
        return '短休息';
      case 'longBreak':
        return '长休息';
      default:
        return '专注工作';
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return 'text-red-600 dark:text-red-400';
      case 'shortBreak':
        return 'text-green-600 dark:text-green-400';
      case 'longBreak':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-red-600 dark:text-red-400';
    }
  };

  return (
    <ToolLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 标题区域 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            番茄时钟
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            专注工作法计时器，提高工作效率和专注力
          </p>
        </div>

        {/* 主计时器 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center space-y-6">
            {/* 模式切换 */}
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => switchMode('work')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'work' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                专注工作
              </button>
              <button
                onClick={() => switchMode('shortBreak')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'shortBreak' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                短休息
              </button>
              <button
                onClick={() => switchMode('longBreak')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'longBreak' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                长休息
              </button>
            </div>

            {/* 当前模式 */}
            <div className={`text-lg font-medium ${getModeColor()}`}>
              {getModeText()}
            </div>

            {/* 圆形进度条和时间显示 */}
            <div className="relative w-64 h-64 mx-auto">
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 256 256">
                {/* 背景圆 */}
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-200 dark:text-gray-700"
                />
                {/* 进度圆 */}
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 112}`}
                  strokeDashoffset={`${2 * Math.PI * 112 * (1 - getProgress() / 100)}`}
                  className={mode === 'work' ? 'text-red-600' : mode === 'shortBreak' ? 'text-green-600' : 'text-blue-600'}
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              
              {/* 时间显示 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {Math.round(getProgress())}% 完成
                  </div>
                </div>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleTimer}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isRunning
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isRunning ? '暂停' : '开始'}</span>
              </button>
              
              <button
                onClick={resetTimer}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 text-white transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                <span>重置</span>
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>设置</span>
              </button>
            </div>
          </div>
        </div>

        {/* 设置面板 */}
        {showSettings && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              番茄时钟设置
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  工作时长（分钟）
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.workDuration}
                  onChange={(e) => setSettings({...settings, workDuration: parseInt(e.target.value) || 25})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  短休息时长（分钟）
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakDuration}
                  onChange={(e) => setSettings({...settings, shortBreakDuration: parseInt(e.target.value) || 5})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  长休息时长（分钟）
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakDuration}
                  onChange={(e) => setSettings({...settings, longBreakDuration: parseInt(e.target.value) || 15})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  长休息间隔（番茄数）
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={settings.longBreakInterval}
                  onChange={(e) => setSettings({...settings, longBreakInterval: parseInt(e.target.value) || 4})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.autoStartBreaks}
                  onChange={(e) => setSettings({...settings, autoStartBreaks: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">自动开始休息</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.autoStartWork}
                  onChange={(e) => setSettings({...settings, autoStartWork: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">自动开始工作</span>
              </label>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                取消
              </button>
              <button
                onClick={() => saveSettings(settings)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                保存设置
              </button>
            </div>
          </div>
        )}

        {/* 统计信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            今日统计
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.completedPomodoros}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                完成番茄
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalWorkTime}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                工作分钟
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.totalBreakTime}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                休息分钟
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center">
            <Coffee className="w-5 h-5 mr-2" />
            番茄工作法说明
          </h3>
          <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
            <li>• <strong>工作25分钟</strong>：专注完成一项任务，避免分心</li>
            <li>• <strong>休息5分钟</strong>：短暂休息，放松大脑</li>
            <li>• <strong>重复4次</strong>：完成4个番茄后进行长休息</li>
            <li>• <strong>长休息15-30分钟</strong>：充分休息，准备下一轮</li>
            <li>• <strong>保持节奏</strong>：培养专注习惯，提高工作效率</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}