'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, Edit, Trash2, TrendingUp, Calendar, BookOpen } from 'lucide-react';

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetHours: number;
  currentHours: number;
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'paused';
  category: string;
}

interface StudySession {
  id: string;
  goalId: string;
  date: string;
  hours: number;
  notes: string;
}

export default function LearningProgressPage() {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);

  // 从localStorage加载数据
  useEffect(() => {
    const savedGoals = localStorage.getItem('learningGoals');
    const savedSessions = localStorage.getItem('studySessions');
    
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  // 保存数据到localStorage
  useEffect(() => {
    localStorage.setItem('learningGoals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('studySessions', JSON.stringify(sessions));
  }, [sessions]);

  const addGoal = (goal: Omit<LearningGoal, 'id'>) => {
    const newGoal: LearningGoal = {
      ...goal,
      id: Date.now().toString(),
    };
    setGoals(prev => [...prev, newGoal]);
    setShowAddGoal(false);
  };

  const updateGoal = (id: string, updates: Partial<LearningGoal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    setSessions(prev => prev.filter(session => session.goalId !== id));
  };

  const addSession = (session: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...session,
      id: Date.now().toString(),
    };
    setSessions(prev => [...prev, newSession]);
    
    // 更新目标进度
    const goal = goals.find(g => g.id === session.goalId);
    if (goal) {
      updateGoal(session.goalId, {
        currentHours: goal.currentHours + session.hours
      });
    }
    
    setShowAddSession(false);
  };

  const getGoalProgress = (goal: LearningGoal) => {
    const progress = (goal.currentHours / goal.targetHours) * 100;
    return Math.min(progress, 100);
  };

  const getGoalStatus = (goal: LearningGoal) => {
    if (goal.status === 'completed') return '已完成';
    if (goal.status === 'paused') return '已暂停';
    return '进行中';
  };

  const getTotalStudyTime = () => {
    return sessions.reduce((total, session) => total + session.hours, 0);
  };

  const getWeeklyStudyTime = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return sessions
      .filter(session => new Date(session.date) >= weekAgo)
      .reduce((total, session) => total + session.hours, 0);
  };

  const categories = [
    '编程语言',
    '框架技术',
    '数据库',
    '算法数据结构',
    '系统设计',
    '其他',
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          学习进度跟踪
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          管理学习目标，记录学习时间，跟踪学习进度
        </p>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">总学习时间</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {getTotalStudyTime()} 小时
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">本周学习</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {getWeeklyStudyTime()} 小时
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">学习目标</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {goals.length} 个
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 学习目标 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              学习目标
            </h2>
            <button
              onClick={() => setShowAddGoal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加目标
            </button>
          </div>

          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {goal.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {goal.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>目标: {goal.targetHours} 小时</span>
                      <span>当前: {goal.currentHours} 小时</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        goal.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        goal.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {getGoalStatus(goal)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowAddSession(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                      title="添加学习记录"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateGoal(goal.id, { status: goal.status === 'active' ? 'paused' : 'active' })}
                      className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded transition-colors"
                      title="切换状态"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                      title="删除目标"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>进度</span>
                    <span>{Math.round(getGoalProgress(goal))}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getGoalProgress(goal)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {goals.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>还没有学习目标，点击"添加目标"开始</p>
              </div>
            )}
          </div>
        </div>

        {/* 学习记录 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              学习记录
            </h2>
            <button
              onClick={() => setShowAddSession(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加记录
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sessions.map((session) => {
              const goal = goals.find(g => g.id === session.goalId);
              return (
                <div key={session.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {goal?.title || '未知目标'}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(session.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {session.hours} 小时
                    </span>
                    {session.notes && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {session.notes}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {sessions.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>还没有学习记录</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 添加目标模态框 */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              添加学习目标
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addGoal({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                targetHours: parseInt(formData.get('targetHours') as string),
                currentHours: 0,
                startDate: formData.get('startDate') as string,
                targetDate: formData.get('targetDate') as string,
                status: 'active',
                category: formData.get('category') as string,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    目标名称
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    描述
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      目标小时
                    </label>
                    <input
                      name="targetHours"
                      type="number"
                      min="1"
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      分类
                    </label>
                    <select
                      name="category"
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      开始日期
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      目标日期
                    </label>
                    <input
                      name="targetDate"
                      type="date"
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    添加目标
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddGoal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 添加学习记录模态框 */}
      {showAddSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              添加学习记录
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addSession({
                goalId: formData.get('goalId') as string,
                date: formData.get('date') as string,
                hours: parseFloat(formData.get('hours') as string),
                notes: formData.get('notes') as string,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    选择目标
                  </label>
                  <select
                    name="goalId"
                    required
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {goals.filter(goal => goal.status === 'active').map(goal => (
                      <option key={goal.id} value={goal.id}>{goal.title}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      学习日期
                    </label>
                    <input
                      name="date"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      学习小时
                    </label>
                    <input
                      name="hours"
                      type="number"
                      min="0.1"
                      step="0.1"
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    备注
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="记录学习内容或心得..."
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    添加记录
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSession(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 