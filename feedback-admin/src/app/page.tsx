import Link from 'next/link'
import { MessageSquare, BarChart3, Settings } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            反馈管理系统
          </h1>
          <p className="text-xl text-gray-600">
            管理和分析用户反馈数据
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* 反馈管理 */}
          <Link href="/admin" className="group">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                反馈管理
              </h3>
              <p className="text-gray-600">
                查看、回复和管理用户反馈
              </p>
            </div>
          </Link>

          {/* 数据分析 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              数据分析
            </h3>
            <p className="text-gray-600">
              反馈统计和趋势分析
            </p>
          </div>

          {/* 系统设置 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              系统设置
            </h3>
            <p className="text-gray-600">
              配置和管理系统参数
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              系统信息
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">版本：</span>
                <span className="text-gray-900">1.0.0</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">状态：</span>
                <span className="text-green-600">运行中</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">数据库：</span>
                <span className="text-gray-900">Supabase</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">API：</span>
                <span className="text-green-600">正常</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
