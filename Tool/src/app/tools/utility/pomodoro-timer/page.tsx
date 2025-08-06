'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Settings, Clock, BarChart3, Target } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface PomodoroSession {
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number;
  completedAt: Date;
}

interface PomodoroStats {
  totalSessions: number;
  totalWorkTime: number;
  totalBreakTime: number;
  todaySessions: number;
  streak: number;
}

export default function PomodoroTimerPage() {
  // 基本设置
  const [workDuration, setWorkDuration] = useState(25); // 分钟
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);

  // 计时器状态
  const [currentSession, setCurrentSession] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(workDuration * 60); // 秒
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  
  // UI状态
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // 统计数据
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [stats, setStats] = useState<PomodoroStats>({
    totalSessions: 0,
    totalWorkTime: 0,
    totalBreakTime: 0,
    todaySessions: 0,
    streak: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化音频
  useEffect(() => {
    audioRef.current = new Audio();
    // 创建一个简单的提示音
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // 这里可以设置提示音，暂时使用简单的方式
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 计时器逻辑
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // 从localStorage加载数据
  useEffect(() => {
    const savedSessions = localStorage.getItem('pomodoro-sessions');
    const savedStats = localStorage.getItem('pomodoro-stats');
    
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        completedAt: new Date(session.completedAt)
      }));
      setSessions(parsedSessions);
    }
    
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  // 保存数据到localStorage
  const saveData = (newSessions: PomodoroSession[], newStats: PomodoroStats) => {
    localStorage.setItem('pomodoro-sessions', JSON.stringify(newSessions));
    localStorage.setItem('pomodoro-stats', JSON.stringify(newStats));
  };

  // 会话完成处理
  const handleSessionComplete = () => {
    setIsRunning(false);
    playNotificationSound();
    
    const newSession: PomodoroSession = {
      type: currentSession,
      duration: getDurationByType(currentSession),
      completedAt: new Date()
    };
    
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    
    // 更新统计
    const newStats = { ...stats };
    newStats.totalSessions += 1;
    
    if (currentSession === 'work') {
      newStats.totalWorkTime += workDuration;
      newStats.todaySessions += 1;
      setSessionCount(prev => prev + 1);
    } else {
      newStats.totalBreakTime += getDurationByType(currentSession);
    }
    
    setStats(newStats);
    saveData(updatedSessions, newStats);
    
    // 自动切换下一个会话
    switchToNextSession();
  };

  // 播放提示音
  const playNotificationSound = () => {
    // 使用Web Audio API创建简单提示音
    try {
      const audioContext = new AudioContext();
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
      // 如果Web Audio API不可用，使用振动API
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  };

  // 获取不同类型会话的时长
  const getDurationByType = (type: 'work' | 'shortBreak' | 'longBreak'): number => {
    switch (type) {
      case 'work': return workDuration;
      case 'shortBreak': return shortBreakDuration;
      case 'longBreak': return longBreakDuration;
    }
  };

  // 切换到下一个会话
  const switchToNextSession = () => {
    if (currentSession === 'work') {
      // 工作完成后，决定是短休息还是长休息
      const nextBreak = sessionCount > 0 && sessionCount % sessionsUntilLongBreak === 0 
        ? 'longBreak' 
        : 'shortBreak';
      setCurrentSession(nextBreak);
      setTimeLeft(getDurationByType(nextBreak) * 60);
    } else {
      // 休息完成后回到工作
      setCurrentSession('work');
      setTimeLeft(workDuration * 60);
    }
  };

  // 手动切换会话类型
  const switchSessionType = (type: 'work' | 'shortBreak' | 'longBreak') => {
    setCurrentSession(type);
    setTimeLeft(getDurationByType(type) * 60);
    setIsRunning(false);
  };

  // 开始/暂停
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // 重置计时器
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDurationByType(currentSession) * 60);
  };

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 获取会话类型的显示文本
  const getSessionTypeText = (type: 'work' | 'shortBreak' | 'longBreak'): string => {
    switch (type) {
      case 'work': return '工作时间';
      case 'shortBreak': return '短休息';
      case 'longBreak': return '长休息';
    }
  };

  // 获取会话类型的颜色
  const getSessionColor = (type: 'work' | 'shortBreak' | 'longBreak'): string => {
    switch (type) {
      case 'work': return 'text-red-600 dark:text-red-400';
      case 'shortBreak': return 'text-green-600 dark:text-green-400';
      case 'longBreak': return 'text-blue-600 dark:text-blue-400';
    }
  };

  // 计算进度百分比
  const getProgress = (): number => {
    const totalDuration = getDurationByType(currentSession) * 60;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  // 今日统计
  const getTodayStats = () => {
    const today = new Date();
    const todaySessions = sessions.filter(session => {
      const sessionDate = new Date(session.completedAt);
      return sessionDate.toDateString() === today.toDateString();
    });

    const workSessions = todaySessions.filter(s => s.type === 'work');
    const totalWorkTime = workSessions.reduce((sum, s) => sum + s.duration, 0);

    return {
      sessions: workSessions.length,
      workTime: totalWorkTime
    };
  };

  const todayStats = getTodayStats();

  return (
    <ToolLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            番茄钟计时器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            提高专注力和工作效率的时间管理工具
          </p>
        </div>

        {/* 主计时器 */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border">
          <div className="text-center space-y-6">
            {/* 会话类型选择 */}
            <div className="flex justify-center space-x-2">
              {(['work', 'shortBreak', 'longBreak'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => switchSessionType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentSession === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {getSessionTypeText(type)}
                </button>
              ))}
            </div>

            {/* 当前会话显示 */}
            <div className={`text-xl font-semibold ${getSessionColor(currentSession)}`}>
              {getSessionTypeText(currentSession)}
            </div>

            {/* 计时器显示 */}
            <div className="relative">
              <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white mb-4">
                {formatTime(timeLeft)}
              </div>
              
              {/* 进度条 */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleTimer}
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                  isRunning 
                    ? 'bg-orange-500 hover:bg-orange-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isRunning ? '暂停' : '开始'}</span>
              </button>
              
              <button
                onClick={resetTimer}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                <span>重置</span>
              </button>
            </div>

            {/* 会话计数 */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              今日完成会话: {sessionCount} / 下次长休息还需: {sessionsUntilLongBreak - (sessionCount % sessionsUntilLongBreak)} 个会话
            </div>
          </div>
        </div>

        {/* 今日统计 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">今日会话</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {todayStats.sessions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">已完成</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">今日专注</h3>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.floor(todayStats.workTime / 60)}h {todayStats.workTime % 60}m
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">工作时间</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">总计</h3>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalSessions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">总会话数</div>
          </div>
        </div>

        {/* 设置和统计按钮 */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>设置</span>
          </button>
          
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>统计</span>
          </button>
        </div>

        {/* 设置面板 */}
        {showSettings && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">计时器设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  工作时长（分钟）
                </label>
                <input
                  type="number"
                  value={workDuration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 25;
                    setWorkDuration(value);
                    if (currentSession === 'work') {
                      setTimeLeft(value * 60);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  短休息时长（分钟）
                </label>
                <input
                  type="number"
                  value={shortBreakDuration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 5;
                    setShortBreakDuration(value);
                    if (currentSession === 'shortBreak') {
                      setTimeLeft(value * 60);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  长休息时长（分钟）
                </label>
                <input
                  type="number"
                  value={longBreakDuration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 15;
                    setLongBreakDuration(value);
                    if (currentSession === 'longBreak') {
                      setTimeLeft(value * 60);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  长休息间隔（会话数）
                </label>
                <input
                  type="number"
                  value={sessionsUntilLongBreak}
                  onChange={(e) => setSessionsUntilLongBreak(parseInt(e.target.value) || 4)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min="2"
                  max="10"
                />
              </div>
            </div>
          </div>
        )}

        {/* 统计面板 */}
        {showStats && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">详细统计</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">总体统计</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">总会话数:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.totalSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">总工作时间:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.floor(stats.totalWorkTime / 60)}h {stats.totalWorkTime % 60}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">总休息时间:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.floor(stats.totalBreakTime / 60)}h {stats.totalBreakTime % 60}m
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">今日统计</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">今日会话:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{todayStats.sessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">今日专注:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.floor(todayStats.workTime / 60)}h {todayStats.workTime % 60}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">平均每会话:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {todayStats.sessions > 0 ? workDuration : 0} 分钟
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 最近会话历史 */}
            {sessions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">最近会话</h4>
                <div className="max-h-32 overflow-y-auto">
                  <div className="space-y-1 text-sm">
                    {sessions.slice(0, 5).map((session, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          {getSessionTypeText(session.type)}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {session.completedAt.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">番茄工作法说明</h3>
          <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
            <p>• <strong>工作25分钟</strong>：专注完成一项任务，避免干扰</p>
            <p>• <strong>短休息5分钟</strong>：放松身心，准备下一个工作周期</p>
            <p>• <strong>长休息15分钟</strong>：每4个工作周期后的长时间休息</p>
            <p>• <strong>坚持执行</strong>：严格按照时间安排，提高工作效率</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}