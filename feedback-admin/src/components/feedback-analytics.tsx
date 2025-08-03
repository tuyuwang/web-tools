'use client';

import { 
  MessageSquare, 
  AlertCircle, 
  Star, 
  BarChart3, 
  CheckCircle, 
  Clock,
  TrendingUp
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

interface FeedbackAnalyticsProps {
  feedbacks: Feedback[];
}

export default function FeedbackAnalytics({ feedbacks }: FeedbackAnalyticsProps) {
  // 计算统计数据
  const stats = {
    total: feedbacks.length,
    new: feedbacks.filter(f => f.status === 'new').length,
    reviewed: feedbacks.filter(f => f.status === 'reviewed').length,
    inProgress: feedbacks.filter(f => f.status === 'in-progress').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
    bugs: feedbacks.filter(f => f.type === 'bug').length,
    features: feedbacks.filter(f => f.type === 'feature').length,
    improvements: feedbacks.filter(f => f.type === 'improvement').length,
    others: feedbacks.filter(f => f.type === 'other').length,
  };

  // 计算解决率
  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 主要统计指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">总计</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">解决率</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{resolutionRate}%</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">问题</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.bugs}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">功能</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.features}</div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">处理进度</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>已解决 ({stats.resolved})</span>
              <span>{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%</span>
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
              <span>处理中 ({stats.inProgress})</span>
              <span>{stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%</span>
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
              <span>新反馈 ({stats.new})</span>
              <span>{stats.total > 0 ? Math.round((stats.new / stats.total) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.total > 0 ? (stats.new / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 