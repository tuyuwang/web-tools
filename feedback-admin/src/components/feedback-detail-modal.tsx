'use client';

import { useState } from 'react';
import { X, Calendar, User, Tag, Edit, Save, XCircle } from 'lucide-react';

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

interface FeedbackDetailModalProps {
  feedback: Feedback | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Feedback>) => Promise<void>;
}

export default function FeedbackDetailModal({
  feedback,
  isOpen,
  onClose,
  onUpdate
}: FeedbackDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Feedback>>({});

  if (!feedback || !isOpen) return null;

  const handleEdit = () => {
    setEditData({
      title: feedback.title,
      description: feedback.description,
      type: feedback.type,
      status: feedback.status
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate(feedback.id, editData);
      setIsEditing(false);
      setEditData({});
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            反馈详情
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md"
              >
                <Edit className="w-4 h-4" />
                编辑
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标题
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.title || feedback.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {feedback.title}
              </h3>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              描述
            </label>
            {isEditing ? (
              <textarea
                value={editData.description || feedback.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {feedback.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date(feedback.timestamp).toLocaleString('zh-CN')}</span>
            </div>
            {feedback.email && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="w-4 h-4" />
                <span>{feedback.email}</span>
              </div>
            )}
            {feedback.tool && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Tag className="w-4 h-4" />
                <span>{feedback.tool}</span>
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              <XCircle className="w-4 h-4" />
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 