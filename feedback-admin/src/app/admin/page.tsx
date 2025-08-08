'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Filter, 
  Search, 
  Calendar, 
  User, 
  Tag, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  BarChart3,
  Settings
} from 'lucide-react';
import FeedbackAnalytics from '@/components/feedback-analytics';
import FeedbackNotification from '@/components/feedback-notification';
import FeedbackFilters from '@/components/feedback-filters';
import FeedbackDetailModal from '@/components/feedback-detail-modal';
import FeedbackBatchActions from '@/components/feedback-batch-actions';
import FeedbackCharts from '@/components/feedback-charts';

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

export default function FeedbackAdminPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [sortBy, setSortBy] = useState<'timestamp' | 'type' | 'status'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const updateFeedbackStatus = async (id: string, status: Feedback['status']) => {
    try {
      const response = await fetch(`/api/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const updatedFeedbacks = feedbacks.map(feedback => 
          feedback.id === id ? { ...feedback, status } : feedback
        );
        setFeedbacks(updatedFeedbacks);
        setNotification({ type: 'success', message: '状态更新成功！' });
      } else {
        throw new Error('更新失败');
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      setNotification({ type: 'error', message: '更新失败，请稍后重试。' });
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm('确定要删除这条反馈吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedFeedbacks = feedbacks.filter(feedback => feedback.id !== id);
        setFeedbacks(updatedFeedbacks);
        setNotification({ type: 'success', message: '反馈删除成功！' });
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      console.error('删除反馈失败:', error);
      setNotification({ type: 'error', message: '删除失败，请稍后重试。' });
    }
  };

  const batchUpdateFeedbacks = async (ids: string[], status: Feedback['status']) => {
    try {
      const promises = ids.map(id => 
        fetch(`/api/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status })
        })
      );

      await Promise.all(promises);
      
      const updatedFeedbacks = feedbacks.map(feedback => 
        ids.includes(feedback.id) ? { ...feedback, status } : feedback
      );
      setFeedbacks(updatedFeedbacks);
      setNotification({ type: 'success', message: `成功更新 ${ids.length} 条反馈状态！` });
    } catch (error) {
      console.error('批量更新失败:', error);
      setNotification({ type: 'error', message: '批量更新失败，请稍后重试。' });
    }
  };

  const batchDeleteFeedbacks = async (ids: string[]) => {
    try {
      const promises = ids.map(id => 
        fetch(`/api/${id}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(promises);
      
      const updatedFeedbacks = feedbacks.filter(feedback => !ids.includes(feedback.id));
      setFeedbacks(updatedFeedbacks);
      setNotification({ type: 'success', message: `成功删除 ${ids.length} 条反馈！` });
    } catch (error) {
      console.error('批量删除失败:', error);
      setNotification({ type: 'error', message: '批量删除失败，请稍后重试。' });
    }
  };

  const handleFeedbackUpdate = async (id: string, data: Partial<Feedback>) => {
    try {
      const response = await fetch(`/api/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updatedFeedbacks = feedbacks.map(feedback => 
          feedback.id === id ? { ...feedback, ...data } : feedback
        );
        setFeedbacks(updatedFeedbacks);
        setNotification({ type: 'success', message: '反馈更新成功！' });
        setShowDetailModal(false);
      } else {
        throw new Error('更新失败');
      }
    } catch (error) {
      console.error('更新反馈失败:', error);
      setNotification({ type: 'error', message: '更新失败，请稍后重试。' });
    }
  };

  const handleFeedbackSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleFeedbackDetail = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setShowDetailModal(true);
  };

  const exportFeedbacks = () => {
    const dataStr = JSON.stringify(feedbacks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedbacks-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 从API获取反馈数据
  const fetchFeedbacks = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch('/api');
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      } else {
        console.error('获取反馈失败');
      }
    } catch (error) {
      console.error('获取反馈失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeedbacks(false);
  };

  const handleClearFilters = () => {
    setFilter('all');
    setSearch('');
    setSortBy('timestamp');
    setSortOrder('desc');
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesFilter = filter === 'all' || feedback.type === filter;
    const matchesSearch = feedback.title.toLowerCase().includes(search.toLowerCase()) ||
                         feedback.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'timestamp':
        aValue = new Date(a.timestamp).getTime();
        bValue = new Date(b.timestamp).getTime();
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // 统计信息
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'bg-red-100 text-red-800';
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'improvement': return 'bg-green-100 text-green-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {notification && (
        <FeedbackNotification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              用户反馈管理
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              查看和管理用户提交的反馈
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              {showCharts ? '隐藏图表' : '显示图表'}
            </button>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              {showAnalytics ? '隐藏分析' : '显示分析'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </div>
      </div>

      {/* 图表组件 */}
      {showCharts && (
        <div className="mb-6">
          <FeedbackCharts feedbacks={feedbacks} />
        </div>
      )}

      {/* 分析组件 */}
      {showAnalytics && (
        <div className="mb-6">
          <FeedbackAnalytics feedbacks={feedbacks} />
        </div>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">总计</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">新反馈</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">已查看</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.reviewed}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">处理中</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">已解决</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
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
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">改进</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.improvements}</div>
        </div>
      </div>

      {/* 批量操作 */}
      <FeedbackBatchActions
        feedbacks={filteredFeedbacks}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onBatchUpdate={batchUpdateFeedbacks}
        onBatchDelete={batchDeleteFeedbacks}
      />

      {/* 筛选和搜索 */}
      <FeedbackFilters
        filter={filter}
        search={search}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
        onSortChange={setSortBy}
        onSortOrderChange={setSortOrder}
        onClearFilters={handleClearFilters}
      />

      {/* 导出按钮 */}
      <div className="flex justify-end mb-6">
        <button
          onClick={exportFeedbacks}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          <Download className="w-4 h-4" />
          导出数据
        </button>
      </div>

      {/* 反馈列表 */}
      <div className="space-y-4">
        {filteredFeedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(feedback.id)}
                    onChange={() => handleFeedbackSelect(feedback.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(feedback.type)}`}>
                    {feedback.type === 'bug' ? '问题' : 
                     feedback.type === 'feature' ? '功能' : 
                     feedback.type === 'improvement' ? '改进' : '其他'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                    {feedback.status === 'new' ? '新反馈' :
                     feedback.status === 'reviewed' ? '已查看' :
                     feedback.status === 'in-progress' ? '处理中' : '已解决'}
                  </span>
                </div>
                <h3 
                  className="text-lg font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => handleFeedbackDetail(feedback)}
                >
                  {feedback.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {feedback.description}
                </p>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex items-center gap-2 ml-4">
                <select
                  value={feedback.status}
                  onChange={(e) => updateFeedbackStatus(feedback.id, e.target.value as Feedback['status'])}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="new">新反馈</option>
                  <option value="reviewed">已查看</option>
                  <option value="in-progress">处理中</option>
                  <option value="resolved">已解决</option>
                </select>
                <button
                  onClick={() => handleFeedbackDetail(feedback)}
                  className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  title="查看详情"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteFeedback(feedback.id)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  title="删除反馈"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(feedback.timestamp).toLocaleString('zh-CN')}</span>
              </div>
              {feedback.email && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{feedback.email}</span>
                </div>
              )}
              {feedback.tool && (
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span>{feedback.tool}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {filteredFeedbacks.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              暂无反馈数据
            </p>
          </div>
        )}
      </div>

      {/* 详情模态框 */}
      <FeedbackDetailModal
        feedback={selectedFeedback}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onUpdate={handleFeedbackUpdate}
      />
    </div>
  );
} 