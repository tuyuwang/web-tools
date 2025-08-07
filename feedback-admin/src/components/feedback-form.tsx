'use client';

import { useState } from 'react';
import { MessageSquare, Send, X, CheckCircle, AlertCircle } from 'lucide-react';
import FeedbackNotification from './feedback-notification';

interface FeedbackData {
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  email?: string;
  tool?: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  email?: string;
}

interface NotificationState {
  show: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'info',
    message: ''
  });
  const [feedback, setFeedback] = useState<FeedbackData>({
    type: 'improvement',
    title: '',
    description: '',
    email: '',
    tool: ''
  });

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ show: true, type, message });
  };

  const hideNotification = () => {
    setNotification({ show: false, type: 'info', message: '' });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!feedback.title.trim()) {
      newErrors.title = '标题不能为空';
    } else if (feedback.title.length < 3) {
      newErrors.title = '标题至少需要3个字符';
    }

    if (!feedback.description.trim()) {
      newErrors.description = '详细描述不能为空';
    } else if (feedback.description.length < 10) {
      newErrors.description = '详细描述至少需要10个字符';
    }

    if (feedback.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(feedback.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        type: feedback.type,
        title: feedback.title.trim(),
        description: feedback.description.trim(),
        email: feedback.email?.trim() || null,
        tool: feedback.tool?.trim() || null,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        status: 'new'
      };

      console.log('提交反馈数据:', feedbackData);

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      const result = await response.json();
      console.log('API响应:', result);

      if (result.success) {
        console.log('提交成功:', result.data);
        
        // 重置表单
        setFeedback({
          type: 'improvement',
          title: '',
          description: '',
          email: '',
          tool: ''
        });
        setErrors({});
        setShowSuccess(true);
        
        // 显示成功通知
        showNotification('success', '感谢您的反馈，我们会认真考虑您的建议。');
        
        // 3秒后关闭成功提示
        setTimeout(() => {
          setShowSuccess(false);
          setIsOpen(false);
        }, 3000);
      } else {
        console.error('API错误响应:', result);
        throw new Error(result.error || '提交失败');
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
      
      // 更详细的错误信息
      let errorMessage = '提交失败，请稍后重试。';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = '网络连接失败，请检查网络连接后重试。';
        } else if (error.message.includes('500')) {
          errorMessage = '服务器内部错误，请稍后重试。';
        } else if (error.message.includes('404')) {
          errorMessage = 'API接口不存在，请联系管理员。';
        } else {
          errorMessage = error.message;
        }
      }
      
      showNotification('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FeedbackData, value: string) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setErrors({});
      setShowSuccess(false);
    }
  };

  return (
    <>
      {notification.show && (
        <FeedbackNotification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
      
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="提供反馈"
        >
          <MessageSquare size={20} />
          <span className="hidden sm:inline">反馈</span>
        </button>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                提供反馈
              </h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                aria-label="关闭"
              >
                <X size={24} />
              </button>
            </div>

            {showSuccess ? (
              <div className="p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  提交成功！
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  感谢您的反馈，我们会认真考虑您的建议。
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* 反馈类型 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    反馈类型 *
                  </label>
                  <select
                    value={feedback.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="improvement">改进建议</option>
                    <option value="feature">功能请求</option>
                    <option value="bug">问题报告</option>
                    <option value="other">其他</option>
                  </select>
                </div>

                {/* 标题 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    标题 *
                  </label>
                  <input
                    type="text"
                    value={feedback.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="简要描述您的反馈"
                    required
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* 详细描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    详细描述 *
                  </label>
                  <textarea
                    value={feedback.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="请详细描述您的反馈、建议或遇到的问题..."
                    required
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* 相关工具 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    相关工具（可选）
                  </label>
                  <input
                    type="text"
                    value={feedback.tool}
                    onChange={(e) => handleInputChange('tool', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：文本分析、图片压缩等"
                  />
                </div>

                {/* 邮箱 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    邮箱（可选）
                  </label>
                  <input
                    type="email"
                    value={feedback.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="用于回复您的反馈"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* 提交按钮 */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md flex items-center justify-center gap-2 transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        提交反馈
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
} 