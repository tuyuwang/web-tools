'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, BarChart3, Target, Calendar, Trash2 } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface Habit {
  id: string;
  name: string;
  description: string;
  color: string;
  goal: number; // 每周目标天数
  createdAt: Date;
}

interface HabitRecord {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
}

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [records, setRecords] = useState<HabitRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    goal: 7
  });

  // 预设颜色
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  // 加载数据
  useEffect(() => {
    const savedHabits = localStorage.getItem('habit-tracker-habits');
    const savedRecords = localStorage.getItem('habit-tracker-records');
    
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  }, []);

  // 保存习惯
  const saveHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    localStorage.setItem('habit-tracker-habits', JSON.stringify(newHabits));
  };

  // 保存记录
  const saveRecords = (newRecords: HabitRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('habit-tracker-records', JSON.stringify(newRecords));
  };

  // 添加习惯
  const addHabit = () => {
    if (newHabit.name.trim()) {
      const habit: Habit = {
        id: Date.now().toString(),
        name: newHabit.name.trim(),
        description: newHabit.description.trim(),
        color: newHabit.color,
        goal: newHabit.goal,
        createdAt: new Date()
      };
      
      saveHabits([...habits, habit]);
      setNewHabit({ name: '', description: '', color: '#3B82F6', goal: 7 });
      setShowAddForm(false);
    }
  };

  // 删除习惯
  const deleteHabit = (habitId: string) => {
    const newHabits = habits.filter(h => h.id !== habitId);
    const newRecords = records.filter(r => r.habitId !== habitId);
    saveHabits(newHabits);
    saveRecords(newRecords);
  };

  // 切换完成状态
  const toggleHabitCompletion = (habitId: string, date: string) => {
    const existingRecord = records.find(r => r.habitId === habitId && r.date === date);
    
    if (existingRecord) {
      const newRecords = records.map(r => 
        r.habitId === habitId && r.date === date 
          ? { ...r, completed: !r.completed }
          : r
      );
      saveRecords(newRecords);
    } else {
      const newRecord: HabitRecord = {
        habitId,
        date,
        completed: true
      };
      saveRecords([...records, newRecord]);
    }
  };

  // 获取日期范围（过去7天）
  const getDateRange = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // 获取习惯在指定日期的完成状态
  const getHabitStatus = (habitId: string, date: string) => {
    const record = records.find(r => r.habitId === habitId && r.date === date);
    return record?.completed || false;
  };

  // 计算习惯统计
  const getHabitStats = (habitId: string) => {
    const habitRecords = records.filter(r => r.habitId === habitId && r.completed);
    const last7Days = getDateRange();
    const completedLast7Days = last7Days.filter(date => getHabitStatus(habitId, date)).length;
    
    const habit = habits.find(h => h.id === habitId);
    const goalAchievement = habit ? (completedLast7Days / habit.goal) * 100 : 0;
    
    return {
      totalCompleted: habitRecords.length,
      completedLast7Days,
      goalAchievement: Math.min(goalAchievement, 100)
    };
  };

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (dateStr === today) return '今天';
    if (dateStr === yesterdayStr) return '昨天';
    
    return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
  };

  const dates = getDateRange();

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            <Target className="h-8 w-8" />
            习惯追踪器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            记录和追踪你的日常习惯，培养良好的生活方式
          </p>
        </div>

        {/* 添加习惯按钮 */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            我的习惯
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            添加习惯
          </button>
        </div>

        {/* 添加习惯表单 */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              添加新习惯
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  习惯名称
                </label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                  placeholder="例如：每天运动30分钟"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  描述（可选）
                </label>
                <input
                  type="text"
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                  placeholder="简短描述这个习惯"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  每周目标天数
                </label>
                <select
                  value={newHabit.goal}
                  onChange={(e) => setNewHabit({...newHabit, goal: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value={1}>1天</option>
                  <option value={2}>2天</option>
                  <option value={3}>3天</option>
                  <option value={4}>4天</option>
                  <option value={5}>5天</option>
                  <option value={6}>6天</option>
                  <option value={7}>7天（每天）</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  颜色
                </label>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewHabit({...newHabit, color})}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newHabit.color === color ? 'border-gray-400' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addHabit}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  添加
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 习惯列表 */}
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              还没有添加任何习惯
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              开始添加你想要培养的好习惯吧！
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              添加第一个习惯
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 日期标题 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-8 gap-2 text-center">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  习惯
                </div>
                {dates.map(date => (
                  <div key={date} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatDate(date)}
                  </div>
                ))}
              </div>
            </div>

            {/* 习惯追踪网格 */}
            {habits.map(habit => {
              const stats = getHabitStats(habit.id);
              return (
                <div key={habit.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-8 gap-2 items-center">
                    {/* 习惯信息 */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: habit.color }}
                        />
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {habit.name}
                        </h4>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      {habit.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {habit.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        目标: {habit.goal}/7天
                      </div>
                    </div>

                    {/* 每日记录 */}
                    {dates.map(date => {
                      const isCompleted = getHabitStatus(habit.id, date);
                      return (
                        <div key={date} className="flex justify-center">
                          <button
                            onClick={() => toggleHabitCompletion(habit.id, date)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isCompleted
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            }`}
                          >
                            {isCompleted && <CheckCircle className="h-4 w-4" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* 进度条 */}
                  <div className="mt-3 pl-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>本周进度:</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            backgroundColor: habit.color,
                            width: `${stats.goalAchievement}%`
                          }}
                        />
                      </div>
                      <span>{stats.completedLast7Days}/{habit.goal}</span>
                      <span className="font-medium">
                        {stats.goalAchievement.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 统计面板 */}
        {habits.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              本周统计
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {habits.map(habit => {
                const stats = getHabitStats(habit.id);
                return (
                  <div key={habit.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {habit.name}
                      </h4>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <p>完成: {stats.completedLast7Days}/{habit.goal}天</p>
                      <p>达成率: {stats.goalAchievement.toFixed(0)}%</p>
                      <p>总完成: {stats.totalCompleted}次</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            使用说明
          </h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            <li>• 点击"添加习惯"创建你想要培养的新习惯</li>
            <li>• 每天点击圆圈按钮记录习惯完成情况</li>
            <li>• 设置每周目标天数，系统会自动计算达成率</li>
            <li>• 查看统计信息了解你的习惯坚持情况</li>
            <li>• 数据保存在本地浏览器中，清除缓存会丢失数据</li>
            <li>• 建议从简单易坚持的习惯开始培养</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}