'use client';

import { 
  MessageSquare, 
  AlertCircle, 
  Star, 
  BarChart3, 
  CheckCircle, 
  Clock
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

interface FeedbackChartsProps {
  feedbacks: Feedback[];
}

export default function FeedbackCharts({ feedbacks }: FeedbackChartsProps) {
  const stats = {
    total: feedbacks.length,
    new: feedbacks.filter(f => f.status === 'new').length,
    reviewed: feedbacks.filter(f => f.status === 'reviewed').length,
    inProgress: feedbacks.filter(f => f.status === 'in-progress').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
    bugs: feedbacks.filter(f => f.type === 'bug').length,
    features: feedbacks.filter(f => f.type === 'feature').length,
    improvements: feedbacks.filter(f => f.type === 'improvement').length,
  };

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">总计</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">解决率</span>
          </div>
          <div className="text-2xl font-bold text-green-600 mt-2">{resolutionRate}%</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">问题</span>
          </div>
          <div className="text-2xl font-bold text-red-600 mt-2">{stats.bugs}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">功能</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-2">{stats.features}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">状态分布</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">新反馈</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.total > 0 ? (stats.new / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.new}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">已查看</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.total > 0 ? (stats.reviewed / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.reviewed}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">处理中</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.inProgress}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">已解决</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.resolved}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 