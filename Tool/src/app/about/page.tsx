'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import { 
  Zap, 
  Shield, 
  Heart, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Users,
  Globe,
  Lightbulb,
  Target,
  Award,
  Rocket
} from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: '快速高效',
      description: '所有工具都经过优化，提供极速的处理体验，让您的工作效率倍增。',
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '安全可靠',
      description: '本地处理，数据不上传，完全保护您的隐私和数据安全。',
      color: 'text-green-600 bg-green-100 dark:bg-green-900'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: '完全免费',
      description: '所有功能完全免费使用，无需注册，无需付费，永久免费。',
      color: 'text-red-600 bg-red-100 dark:bg-red-900'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: '多语言支持',
      description: '支持中英文界面，满足不同用户的使用需求。',
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900'
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: '持续创新',
      description: '不断添加新工具和功能，根据用户需求持续改进。',
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: '专业精准',
      description: '每个工具都经过精心设计，确保功能专业、结果准确。',
      color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900'
    }
  ];

  const toolCategories = [
    {
      name: '文本处理',
      description: '文本转换、格式化、编码解码等',
      tools: ['Base64编码', 'URL编码', 'JSON格式化', 'Markdown转换'],
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    },
    {
      name: '图片处理',
      description: '图片压缩、格式转换、尺寸调整',
      tools: ['图片压缩', '格式转换', '尺寸调整', '水印添加'],
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    },
    {
      name: '开发工具',
      description: '代码格式化、API测试、开发辅助',
      tools: ['代码格式化', 'API测试', '正则表达式', '颜色选择器'],
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    },
    {
      name: '学习工具',
      description: '笔记管理、进度跟踪、学习辅助',
      tools: ['智能笔记', '学习进度', '计算器', '速查表'],
      color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
    }
  ];

  const stats = [
    { number: '50+', label: '实用工具', icon: <Award className="w-5 h-5" /> },
    { number: '10+', label: '工具分类', icon: <Target className="w-5 h-5" /> },
    { number: '100%', label: '免费使用', icon: <Heart className="w-5 h-5" /> },
    { number: '24/7', label: '随时可用', icon: <Rocket className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              关于我们的
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> 工具平台</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              我们致力于为用户提供最实用、最高效的在线工具集合，让每一个任务都变得简单快捷。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tools"
                className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                立即开始使用
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/tools/learn"
                className="btn btn-outline text-lg px-8 py-4 transform hover:-translate-y-1 transition-all duration-300"
              >
                学习中心
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
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

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              为什么选择我们？
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              我们专注于提供最优质的工具体验，让您的工作更加高效便捷
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Overview Section */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              工具分类概览
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              涵盖各个领域的专业工具，满足您的不同需求
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {toolCategories.map((category, index) => (
              <div
                key={index}
                className={`rounded-xl p-6 border-2 hover:shadow-lg transition-all duration-300 ${category.color}`}
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {category.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {category.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.tools.map((tool, toolIndex) => (
                    <span
                      key={toolIndex}
                      className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-gray-200 dark:border-gray-600"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              开始使用
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              简单三步，立即开始使用我们的工具
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                选择工具
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                从工具分类中选择您需要的功能
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                输入数据
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                输入或上传您要处理的数据
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                获取结果
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                立即获得处理结果，下载或复制使用
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            准备好提升您的工作效率了吗？
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            立即开始使用我们的工具，体验前所未有的便捷和高效
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools"
              className="bg-white text-blue-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              开始使用工具
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </Link>
            <Link
              href="/tools/learn"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              访问学习中心
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}