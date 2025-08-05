'use client';

import { useState, useEffect, useRef } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Play, Pause, RotateCcw, Settings, Clock, Coffee, Target } from 'lucide-react';

interface PomodoroStats {
  completedPomodoros: number;
  totalFocusTime: number;
  totalBreakTime: number;
  todayPomodoros: number;
}

export default function PomodoroPage() {
  const [workTime, setWorkTime] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  
  const [currentTime, setCurrentTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const [stats, setStats] = useState<PomodoroStats>({
    completedPomodoros: 0,
    totalFocusTime: 0,
    totalBreakTime: 0,
    todayPomodoros: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isActive && currentTime > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(time => time - 1);
      }, 1000);
    } else if (currentTime === 0) {
      handleTimerComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, currentTime]);

  const handleTimerComplete = () => {
    setIsActive(false);
    playNotificationSound();

    if (mode === 'work') {
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);
      
      setStats(prev => ({
        ...prev,
        completedPomodoros: prev.completedPomodoros + 1,
        totalFocusTime: prev.totalFocusTime + workTime,
        todayPomodoros: prev.todayPomodoros + 1,
      }));

      if (newCompletedPomodoros % longBreakInterval === 0) {
        setMode('longBreak');
        setCurrentTime(longBreak * 60);
      } else {
        setMode('shortBreak');
        setCurrentTime(shortBreak * 60);
      }
    } else {
      setStats(prev => ({
        ...prev,
        totalBreakTime: prev.totalBreakTime + (mode === 'shortBreak' ? shortBreak : longBreak),
      }));
      
      setMode('work');
      setCurrentTime(workTime * 60);
    }
  };

  const playNotificationSound = () => {
    // 创建简单的提示音
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
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode('work');
    setCurrentTime(workTime * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeText = () => {
    switch (mode) {
      case 'work': return '专注工作';
      case 'shortBreak': return '短休息';
      case 'longBreak': return '长休息';
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work': return 'text-red-600 dark:text-red-400';
      case 'shortBreak': return 'text-green-600 dark:text-green-400';
      case 'longBreak': return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getProgressColor = () => {
    switch (mode) {
      case 'work': return 'from-red-500 to-red-600';
      case 'shortBreak': return 'from-green-500 to-green-600';
      case 'longBreak': return 'from-blue-500 to-blue-600';
    }
  };

  const getTotalTime = () => {
    switch (mode) {
      case 'work': return workTime * 60;
      case 'shortBreak': return shortBreak * 60;
      case 'longBreak': return longBreak * 60;
    }
  };

  const progress = ((getTotalTime() - currentTime) / getTotalTime()) * 100;

  return (
    <ToolLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <Clock className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            番茄工作法
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            25分钟专注工作，5分钟休息，提高工作效率
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主计时器 */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center space-y-6">
              {/* 当前模式 */}
              <div className={`text-lg font-medium ${getModeColor()}`}>
                {getModeText()}
              </div>

              {/* 计时器显示 */}
              <div className="relative">
                <div className="text-6xl sm:text-8xl font-mono font-bold text-gray-900 dark:text-white">
                  {formatTime(currentTime)}
                </div>
                
                {/* 进度条 */}
                <div className="mt-6 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${getProgressColor()} h-2 rounded-full transition-all duration-1000 ease-linear`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* 控制按钮 */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleTimer}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      暂停
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      开始
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetTimer}
                  className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  重置
                </button>
                
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  设置
                </button>
              </div>

              {/* 番茄钟计数 */}
              <div className="flex justify-center items-center space-x-2">
                <Target className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  今日完成: {completedPomodoros} 个番茄钟
                </span>
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 统计信息 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📊 统计信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">总番茄钟</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats.completedPomodoros}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">专注时间</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.floor(stats.totalFocusTime / 60)}小时{stats.totalFocusTime % 60}分钟
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">休息时间</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.floor(stats.totalBreakTime / 60)}小时{stats.totalBreakTime % 60}分钟
                  </span>
                </div>
              </div>
            </div>

            {/* 设置面板 */}
            {showSettings && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  ⚙️ 设置
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      工作时间 (分钟)
                    </label>
                    <input
                      type="number"
                      value={workTime}
                      onChange={(e) => setWorkTime(parseInt(e.target.value) || 25)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      min="1"
                      max="60"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      短休息 (分钟)
                    </label>
                    <input
                      type="number"
                      value={shortBreak}
                      onChange={(e) => setShortBreak(parseInt(e.target.value) || 5)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      min="1"
                      max="30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      长休息 (分钟)
                    </label>
                    <input
                      type="number"
                      value={longBreak}
                      onChange={(e) => setLongBreak(parseInt(e.target.value) || 15)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      min="1"
                      max="60"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      长休息间隔
                    </label>
                    <input
                      type="number"
                      value={longBreakInterval}
                      onChange={(e) => setLongBreakInterval(parseInt(e.target.value) || 4)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      min="2"
                      max="10"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center">
            <Coffee className="h-5 w-5 mr-2" />
            番茄工作法原理
          </h3>
          <ul className="text-amber-800 dark:text-amber-200 space-y-1 text-sm">
            <li>• <strong>专注工作：</strong>25分钟全身心投入工作，避免干扰</li>
            <li>• <strong>短暂休息：</strong>5分钟放松休息，恢复注意力</li>
            <li>• <strong>长时间休息：</strong>完成4个番茄钟后，休息15-30分钟</li>
            <li>• <strong>记录跟踪：</strong>记录完成的番茄钟数量，分析工作效率</li>
            <li>• <strong>持续改进：</strong>根据实际情况调整工作和休息时间</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}