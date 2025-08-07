'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Settings, BarChart3, Clock, Coffee, Target } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useLanguage } from '@/components/language-provider';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';
type TimerStatus = 'idle' | 'running' | 'paused';

interface PomodoroSettings {
  workDuration: number; // 分钟
  shortBreakDuration: number; // 分钟
  longBreakDuration: number; // 分钟
  longBreakInterval: number; // 多少个工作周期后长休息
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
}

interface PomodoroStats {
  completedPomodoros: number;
  totalWorkTime: number; // 分钟
  totalBreakTime: number; // 分钟
  dailyGoal: number;
  streak: number;
}

export default function PomodoroPage() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
  });

  const [stats, setStats] = useState<PomodoroStats>({
    completedPomodoros: 0,
    totalWorkTime: 0,
    totalBreakTime: 0,
    dailyGoal: 8,
    streak: 0,
  });

  const [currentMode, setCurrentMode] = useState<TimerMode>('work');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60); // 秒
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化音频
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjaV2e/Neyc';
    }
  }, []);

  const getCurrentDuration = useCallback(() => {
    switch (currentMode) {
      case 'work':
        return settings.workDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
      default:
        return settings.workDuration * 60;
    }
  }, [currentMode, settings]);

  const playSound = useCallback(() => {
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  }, [settings.soundEnabled]);

  const startTimer = useCallback(() => {
    if (status === 'idle') {
      setTimeLeft(getCurrentDuration());
    }
    setStatus('running');

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // 计时器结束
          playSound();
          
          if (currentMode === 'work') {
            setStats(prevStats => ({
              ...prevStats,
              completedPomodoros: prevStats.completedPomodoros + 1,
              totalWorkTime: prevStats.totalWorkTime + settings.workDuration,
            }));
            setCycleCount(prev => prev + 1);
            
            // 决定下一个模式
            const nextCycleCount = cycleCount + 1;
            if (nextCycleCount % settings.longBreakInterval === 0) {
              setCurrentMode('longBreak');
            } else {
              setCurrentMode('shortBreak');
            }
          } else {
            setStats(prevStats => ({
              ...prevStats,
              totalBreakTime: prevStats.totalBreakTime + 
                (currentMode === 'shortBreak' ? settings.shortBreakDuration : settings.longBreakDuration),
            }));
            setCurrentMode('work');
          }
          
          setStatus('idle');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [status, getCurrentDuration, playSound, currentMode, cycleCount, settings]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus('paused');
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus('idle');
    setTimeLeft(getCurrentDuration());
  }, [getCurrentDuration]);

  const skipTimer = useCallback(() => {
    stopTimer();
    if (currentMode === 'work') {
      const nextCycleCount = cycleCount + 1;
      setCycleCount(nextCycleCount);
      if (nextCycleCount % settings.longBreakInterval === 0) {
        setCurrentMode('longBreak');
      } else {
        setCurrentMode('shortBreak');
      }
    } else {
      setCurrentMode('work');
    }
  }, [stopTimer, currentMode, cycleCount, settings.longBreakInterval]);

  // 更新计时器时间当模式改变时
  useEffect(() => {
    if (status === 'idle') {
      setTimeLeft(getCurrentDuration());
    }
  }, [currentMode, getCurrentDuration, status]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = getCurrentDuration();
    return ((total - timeLeft) / total) * 100;
  };

  const getModeConfig = () => {
    switch (currentMode) {
      case 'work':
        return {
          title: '专注工作',
          icon: Target,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          progressColor: 'text-red-600',
        };
      case 'shortBreak':
        return {
          title: '短休息',
          icon: Coffee,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          progressColor: 'text-green-600',
        };
      case 'longBreak':
        return {
          title: '长休息',
          icon: Coffee,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          progressColor: 'text-blue-600',
        };
    }
  };

  const modeConfig = getModeConfig();
  const IconComponent = modeConfig.icon;

  return (
    <ToolLayout
      title="番茄工作法计时器"
      description="专注工作计时器，帮助提高工作效率和专注力"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 主计时器界面 */}
        <div className={`rounded-lg border border-gray-200 dark:border-gray-700 p-8 ${modeConfig.bgColor}`}>
          <div className="text-center space-y-6">
            {/* 模式指示 */}
            <div className="flex items-center justify-center space-x-2">
              <IconComponent className={`w-6 h-6 ${modeConfig.color}`} />
              <h2 className={`text-2xl font-bold ${modeConfig.color}`}>
                {modeConfig.title}
              </h2>
            </div>

            {/* 时间显示 */}
            <div className="relative">
              <div className={`text-8xl font-mono font-bold ${modeConfig.color} mb-4`}>
                {formatTime(timeLeft)}
              </div>
              
              {/* 进度条 */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    currentMode === 'work' ? 'bg-red-500' :
                    currentMode === 'shortBreak' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center justify-center space-x-4">
              {status === 'idle' || status === 'paused' ? (
                <button
                  onClick={startTimer}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>{status === 'paused' ? '继续' : '开始'}</span>
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Pause className="w-5 h-5" />
                  <span>暂停</span>
                </button>
              )}
              
              <button
                onClick={stopTimer}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Square className="w-5 h-5" />
                <span>停止</span>
              </button>

              <button
                onClick={skipTimer}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                跳过
              </button>
            </div>

            {/* 周期信息 */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>第 {cycleCount + 1} 个工作周期</p>
              <p>距离长休息还有 {settings.longBreakInterval - (cycleCount % settings.longBreakInterval)} 个周期</p>
            </div>
          </div>
        </div>

        {/* 统计和设置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 今日统计 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                今日统计
              </h3>
              <button
                onClick={() => setShowStats(!showStats)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">完成番茄钟</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.completedPomodoros} / {stats.dailyGoal}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 bg-red-500 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.completedPomodoros / stats.dailyGoal) * 100, 100)}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">工作时间</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {Math.floor(stats.totalWorkTime / 60)}h {stats.totalWorkTime % 60}m
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">休息时间</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {Math.floor(stats.totalBreakTime / 60)}h {stats.totalBreakTime % 60}m
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 设置 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                设置
              </h3>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {showSettings && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    工作时长 ({settings.workDuration} 分钟)
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="5"
                    value={settings.workDuration}
                    onChange={(e) => setSettings({...settings, workDuration: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    短休息 ({settings.shortBreakDuration} 分钟)
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={settings.shortBreakDuration}
                    onChange={(e) => setSettings({...settings, shortBreakDuration: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    长休息 ({settings.longBreakDuration} 分钟)
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="30"
                    step="5"
                    value={settings.longBreakDuration}
                    onChange={(e) => setSettings({...settings, longBreakDuration: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => setSettings({...settings, soundEnabled: e.target.checked})}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">启用提示音</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.autoStartBreaks}
                      onChange={(e) => setSettings({...settings, autoStartBreaks: e.target.checked})}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">自动开始休息</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            番茄工作法介绍
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• <strong>工作25分钟:</strong> 专注于一项任务，避免干扰和分心</p>
            <p>• <strong>短休息5分钟:</strong> 放松身心，准备下一个工作周期</p>
            <p>• <strong>长休息15-30分钟:</strong> 每4个工作周期后进行长时间休息</p>
            <p>• <strong>记录统计:</strong> 跟踪完成的番茄钟数量和工作时间</p>
            <p>• <strong>自定义设置:</strong> 根据个人需求调整时间长度和提醒设置</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}