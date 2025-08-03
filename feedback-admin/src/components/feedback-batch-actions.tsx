'use client';

import { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Edit3, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
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

interface FeedbackBatchActionsProps {
  feedbacks: Feedback[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onBatchUpdate: (ids: string[], status: Feedback['status']) => Promise<void>;
  onBatchDelete: (ids: string[]) => Promise<void>;
}

export default function FeedbackBatchActions({
  feedbacks,
  selectedIds,
  onSelectionChange,
  onBatchUpdate,
  onBatchDelete
}: FeedbackBatchActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const allSelected = selectedIds.length === feedbacks.length && feedbacks.length > 0;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(feedbacks.map(f => f.id));
    }
  };

  const handleBatchUpdate = async (status: Feedback['status']) => {
    if (selectedIds.length === 0) return;
    
    setIsUpdating(true);
    try {
      await onBatchUpdate(selectedIds, status);
      onSelectionChange([]);
    } catch (error) {
      console.error('批量更新失败:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (!confirm(`确定要删除选中的 ${selectedIds.length} 条反馈吗？此操作不可撤销。`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await onBatchDelete(selectedIds);
      onSelectionChange([]);
    } catch (error) {
      console.error('批量删除失败:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (feedbacks.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {allSelected ? '取消全选' : '全选'}
          </button>
          
          {selectedIds.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              已选择 {selectedIds.length} 项
            </span>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => handleBatchUpdate(e.target.value as Feedback['status'])}
              disabled={isUpdating}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            >
              <option value="">批量更新状态</option>
              <option value="new">新反馈</option>
              <option value="reviewed">已查看</option>
              <option value="in-progress">处理中</option>
              <option value="resolved">已解决</option>
            </select>

            <button
              onClick={handleBatchDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? '删除中...' : '批量删除'}
            </button>
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>快速操作：</span>
            <button
              onClick={() => handleBatchUpdate('reviewed')}
              disabled={isUpdating}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded disabled:opacity-50"
            >
              <Eye className="w-3 h-3" />
              标记已查看
            </button>
            <button
              onClick={() => handleBatchUpdate('in-progress')}
              disabled={isUpdating}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded disabled:opacity-50"
            >
              <Clock className="w-3 h-3" />
              标记处理中
            </button>
            <button
              onClick={() => handleBatchUpdate('resolved')}
              disabled={isUpdating}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded disabled:opacity-50"
            >
              <CheckCircle className="w-3 h-3" />
              标记已解决
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 