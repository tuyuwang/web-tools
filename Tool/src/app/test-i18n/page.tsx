'use client';

import { useLanguage } from '@/components/language-provider';
import { tools } from '@/lib/tools-data';
import { useState, useEffect } from 'react';

export default function TestI18nPage() {
  const { t, locale, setLocale } = useLanguage();
  const [currentTitle, setCurrentTitle] = useState('');

  useEffect(() => {
    setCurrentTitle(document.title);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            翻译功能测试页面
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLocale('zh-CN')}
              className={`px-3 py-1 rounded text-sm ${
                locale === 'zh-CN'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => setLocale('en-US')}
              className={`px-3 py-1 rounded text-sm ${
                locale === 'en-US'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* 网站标题翻译测试 */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              网站标题翻译测试
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>网站标题:</strong> {t.metadata.title}</p>
              <p><strong>网站描述:</strong> {t.metadata.description}</p>
              <p><strong>网站关键词:</strong> {t.metadata.keywords}</p>
              <p><strong>网站名称:</strong> {t.metadata.siteName}</p>
              <p><strong>当前页面标题:</strong> {currentTitle}</p>
            </div>
          </section>

          {/* 首页翻译测试 */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              首页翻译测试
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>标题:</strong> {t.home.hero.title}</p>
              <p><strong>副标题:</strong> {t.home.hero.subtitle}</p>
              <p><strong>开始按钮:</strong> {t.home.hero.cta.start}</p>
              <p><strong>了解更多按钮:</strong> {t.home.hero.cta.learnMore}</p>
            </div>
          </section>

          {/* 工具列表翻译测试 */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              工具列表翻译测试
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>页面标题:</strong> {t.tools.title}</p>
              <p><strong>页面副标题:</strong> {t.tools.subtitle}</p>
              <p><strong>搜索占位符:</strong> {t.tools.search.placeholder}</p>
              <p><strong>热门标签:</strong> {t.tools.popular}</p>
            </div>
          </section>

          {/* 分类翻译测试 */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              分类翻译测试
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <p><strong>全部:</strong> {t.tools.categories.all}</p>
              <p><strong>文本工具:</strong> {t.tools.categories.text}</p>
              <p><strong>图片工具:</strong> {t.tools.categories.image}</p>
              <p><strong>开发工具:</strong> {t.tools.categories.dev}</p>
              <p><strong>实用工具:</strong> {t.tools.categories.utility}</p>
              <p><strong>学习工具:</strong> {t.tools.categories.learn}</p>
              <p><strong>健康工具:</strong> {t.tools.categories.health}</p>
              <p><strong>媒体工具:</strong> {t.tools.categories.media}</p>
              <p><strong>办公工具:</strong> {t.tools.categories.office}</p>
              <p><strong>安全工具:</strong> {t.tools.categories.security}</p>
            </div>
          </section>

          {/* 工具名称翻译测试 */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              工具名称翻译测试 (前10个工具)
            </h2>
            <div className="space-y-2 text-sm">
              {tools.slice(0, 10).map((tool) => (
                <div key={tool.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <p><strong>ID:</strong> {tool.id}</p>
                  <p><strong>原始名称:</strong> {tool.name}</p>
                  <p><strong>翻译名称:</strong> {t.toolNames[tool.id as keyof typeof t.toolNames] || '未翻译'}</p>
                  <p><strong>原始描述:</strong> {tool.description}</p>
                  <p><strong>翻译描述:</strong> {t.toolDescriptions[tool.id as keyof typeof t.toolDescriptions] || '未翻译'}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 主题切换翻译测试 */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              主题切换翻译测试
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>浅色:</strong> {t.theme.light}</p>
              <p><strong>深色:</strong> {t.theme.dark}</p>
              <p><strong>系统:</strong> {t.theme.system}</p>
            </div>
          </section>

          {/* 当前语言信息 */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              当前语言信息
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>当前语言:</strong> {locale}</p>
              <p><strong>语言代码:</strong> {locale === 'zh-CN' ? '中文简体' : 'English'}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 