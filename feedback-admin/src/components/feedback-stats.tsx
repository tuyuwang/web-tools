'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  AlertCircle, 
  Star, 
  BarChart3, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';

interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  email?: string;
  tool?: string;
  timestamp: string;
  status: 'new' | 'reviewed' | 'in-progress' | 'resolved';
}

interface FeedbackStatsProps {
  feedbacks: Feedback[];
}

export default function FeedbackStats({ feedbacks }: FeedbackStatsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // 根据时间范围过滤反馈
  const getFilteredFeedbacks = () => {
    if (timeRange === 'all') return feedbacks;
    
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return feedbacks.filter(feedback => 
      new Date(feedback.timestamp) >= cutoffDate
    );
  };

  const filteredFeedbacks = getFilteredFeedbacks();

  // 计算统计数据
  const stats = {
    total: filteredFeedbacks.length,
    new: filteredFeedbacks.filter(f => f.status === 'new').length,
    reviewed: filteredFeedbacks.filter(f => f.status === 'reviewed').length,
    inProgress: filteredFeedbacks.filter(f => f.status === 'in-progress').length,
    resolved: filteredFeedbacks.filter(f => f.status === 'resolved').length,
    bugs: filteredFeedbacks.filter(f => f.type === 'bug').length,
    features: filteredFeedbacks.filter(f => f.type === 'feature').length,
    improvements: filteredFeedbacks.filter(f => f.type === 'improvement').length,
    others: filteredFeedbacks.filter(f => f.type === 'other').length,
  };

  // 计算解决率
  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  
  // 计算平均响应时间（模拟数据）
  const avgResponseTime = stats.total > 0 ? Math.round(stats.total * 0.8) : 0;

  // 按类型统计
  const typeStats = [
    { name: '问题报告', count: stats.bugs, color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertCircle },
    { name: '功能请求', count: stats.features, color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Star },
    { name: '改进建议', count: stats.improvements, color: 'text-green-600', bgColor: 'bg-green-100', icon: BarChart3 },
    { name: '其他', count: stats.others, color: 'text-gray-600', bgColor: 'bg-gray-100', icon: MessageSquare },
  ];

  // 按状态统计
  const statusStats = [
    { name: '新反馈', count: stats.new, color: 'text-blue-600', bgColor: 'bg-blue-100', icon: MessageSquare },
    { name: '已查看', count: stats.reviewed, color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
    { name: '处理中', count: stats.inProgress, color: 'text-orange-600', bgColor: 'bg-orange-100', icon: TrendingUp },
    { name: '已解决', count: stats.resolved, color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* 时间范围选择 */}
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">统计时间范围</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="7d">最近7天</option>
          <option value="30d">最近30天</option>
          <option value="90d">最近90天</option>
          <option value="all">全部时间</option>
        </select>
      </div>

      {/* 主要统计指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">总反馈数</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">解决率</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{resolutionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">平均响应时间</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgResponseTime}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">活跃用户</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredFeedbacks.filter(f => f.email).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 按类型统计 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">按类型统计</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {typeStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-2`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 按状态统计 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">按状态统计</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-2`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 进度条显示 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">处理进度</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>已解决</span>
              <span>{stats.resolved}/{stats.total}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>处理中</span>
              <span>{stats.inProgress}/{stats.total}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>已查看</span>
              <span>{stats.reviewed}/{stats.total}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.total > 0 ? (stats.reviewed / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 