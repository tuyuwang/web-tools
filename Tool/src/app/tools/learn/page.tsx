'use client';

import Link from 'next/link';
import { ToolLayout } from '@/components/tool-layout';
import { 
  BookOpen, 
  Calculator, 
  FileText, 
  TrendingUp, 
  Clock, 
  Target,
  Award,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Brain,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { useToolTranslations } from '@/components/tool-translations';

export default function LearnPage() {
  const { getToolTranslation } = useToolTranslations();
  
  const learningTools = [
    {
      id: 'notes',
      title: '智能笔记',
      description: '创建、管理和搜索您的学习笔记，支持富文本编辑和标签分类',
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
      features: ['富文本编辑', '快速搜索', '标签分类', '本地存储'],
      href: '/tools/learn/notes',
      status: 'available'
    },
    {
      id: 'progress',
      title: '学习进度',
      description: '跟踪您的学习目标和进度，设置里程碑并监控完成情况',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
      features: ['目标设定', '进度跟踪', '数据可视化', '成就系统'],
      href: '/tools/learn/progress',
      status: 'available'
    },
    {
      id: 'calculator',
      title: '学习计算器',
      description: '多功能计算器，支持基础运算、科学计算和程序员模式',
      icon: <Calculator className="w-8 h-8" />,
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
      features: ['基础运算', '科学计算', '程序员模式', '历史记录'],
      href: '/tools/learn/calculator',
      status: 'available'
    },
    {
      id: 'cheatsheet',
      title: '速查表',
      description: '常用编程语言、工具和概念的快速参考手册',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400',
      features: ['多语言支持', '快速搜索', '代码示例', '离线可用'],
      href: '/tools/learn/cheatsheet',
      status: 'available'
    }
  ];

  const learningStats = [
    { 
      icon: <Brain className="w-6 h-6" />, 
      number: '4', 
      label: '学习工具',
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900'
    },
    { 
      icon: <Target className="w-6 h-6" />, 
      number: '∞', 
      label: '学习目标',
      color: 'text-green-600 bg-green-100 dark:bg-green-900'
    },
    { 
      icon: <Clock className="w-6 h-6" />, 
      number: '24/7', 
      label: '随时可用',
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900'
    },
    { 
      icon: <Award className="w-6 h-6" />, 
      number: '100%', 
      label: '免费使用',
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900'
    }
  ];

  const learningTips = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: '制定学习计划',
      description: '使用学习进度工具设定明确的目标和时间线',
      color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: '记录学习笔记',
      description: '及时记录重要知识点，建立个人知识库',
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: '定期回顾总结',
      description: '利用进度跟踪功能定期回顾学习成果',
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    }
  ];

  return (
    <ToolLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                学习中心
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block mt-2">
                  Learning Hub
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                提供全方位的学习工具和资源，帮助您高效学习、记录知识、跟踪进度，让学习变得更加有趣和高效。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="#tools"
                  className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  开始学习
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="#tips"
                  className="btn btn-outline text-lg px-8 py-4 transform hover:-translate-y-1 transition-all duration-300"
                >
                  学习技巧
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {learningStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Tools Section */}
        <section id="tools" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                学习工具
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                专为学习优化的工具集合，帮助您更好地组织知识、跟踪进度和提升效率
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {learningTools.map((tool, index) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group block"
                >
                  <div className={`rounded-2xl p-8 border-2 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${tool.color.split(' text-')[0]} hover:border-opacity-60`}>
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${tool.color.split(' ')[0]} ${tool.color.split(' ').pop()}`}>
                        {tool.icon}
                      </div>
                      {tool.status === 'available' && (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle className="w-5 h-5 mr-1" />
                          <span className="text-sm font-medium">可用</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      {tool.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {tool.features.map((feature, featureIndex) => (
                        <span
                          key={featureIndex}
                          className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-gray-200 dark:border-gray-600"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                        立即使用
                      </span>
                      <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Tips Section */}
        <section id="tips" className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                学习技巧
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                掌握这些技巧，让您的学习更加高效和有趣
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {learningTips.map((tip, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-6 border-2 hover:shadow-lg transition-all duration-300 ${tip.color}`}
                >
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4 text-gray-700 dark:text-gray-300">
                    {tip.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {tip.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              开始您的学习之旅
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              选择适合您的学习工具，制定学习计划，记录学习过程，跟踪学习进度
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tools/learn/notes"
                className="bg-white text-blue-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                开始记笔记
                <FileText className="w-5 h-5 ml-2 inline" />
              </Link>
              <Link
                href="/tools/learn/progress"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                跟踪进度
                <TrendingUp className="w-5 h-5 ml-2 inline" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </ToolLayout>
  );
}