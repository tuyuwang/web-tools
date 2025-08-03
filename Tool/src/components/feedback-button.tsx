'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { supabase, FeedbackData } from '@/lib/supabase-client';
import { getAllToolNames, getToolByPath } from '@/lib/tools-data';

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<string>('');
  const [currentToolName, setCurrentToolName] = useState<string>('');
  const [formData, setFormData] = useState<FeedbackData>({
    title: '',
    description: '',
    type: 'general',
    email: '',
    tool: '',
  });

  const types = [
    { value: 'general', label: '一般反馈' },
    { value: 'bug', label: '问题报告' },
    { value: 'feature', label: '功能建议' },
    { value: 'improvement', label: '改进建议' },
  ];

  const allTools = getAllToolNames();

  // 检测当前页面并设置工具
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      
      // 检查是否在工具详情页面
      if (path.startsWith('/tools/') && path !== '/tools') {
        const tool = getToolByPath(path);
        if (tool) {
          setCurrentTool(tool.id);
          setCurrentToolName(tool.name);
          setFormData(prev => ({ ...prev, tool: tool.name }));
        }
      } else {
        // 在工具列表页面或其他页面，清空工具选择
        setCurrentTool('');
        setCurrentToolName('');
        setFormData(prev => ({ ...prev, tool: '' }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 检查Supabase客户端是否可用
      if (!supabase) {
        throw new Error('Supabase客户端未初始化');
      }

      // 使用环境变量中的站点URL
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const pageUrl = window.location.href.replace(window.location.origin, siteUrl);

      const feedbackData: FeedbackData = {
        ...formData,
        page_url: pageUrl,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      // 直接调用Supabase
      const { data, error } = await supabase
        .from('feedbacks')
        .insert([feedbackData]);

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
        // 重置表单时保持当前工具选择
        setFormData({ title: '', description: '', type: 'general', email: '', tool: currentToolName || '' });
      }, 2000);
    } catch (error) {
      console.error('反馈提交失败:', error);
      setError('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FeedbackData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="反馈"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* 弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 弹窗内容 */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                反馈建议
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6">
              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-700 dark:text-green-300">
                      反馈提交成功！感谢您的建议。
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700 dark:text-red-300">
                      {error}
                    </span>
                  </div>
                </div>
              )}

              {/* 反馈表单 */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 标题 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="请输入反馈标题"
                  />
                </div>

                {/* 工具选择 */}
                <div>
                  <label htmlFor="tool" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    相关工具
                  </label>
                  <div className="relative">
                    <select
                      id="tool"
                      value={formData.tool}
                      onChange={(e) => handleInputChange('tool', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none"
                    >
                      <option value="">选择相关工具（可选）</option>
                      {allTools.map((tool) => (
                        <option key={tool.id} value={tool.name}>
                          {tool.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {currentToolName && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      当前页面：{currentToolName}
                    </p>
                  )}
                </div>

                {/* 邮箱 */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    邮箱
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="请输入您的邮箱（可选）"
                  />
                </div>

                {/* 反馈类型 */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    反馈类型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    required
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {types.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 反馈内容 */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    反馈内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    placeholder="请详细描述您的反馈、建议或遇到的问题..."
                  />
                </div>

                {/* 提交按钮 */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      提交中...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      提交反馈
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 