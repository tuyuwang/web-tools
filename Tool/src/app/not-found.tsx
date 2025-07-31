import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          页面未找到
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          抱歉，您访问的页面不存在。
        </p>
        <div className="space-x-4">
          <Link
            href="/"
            className="btn btn-primary"
          >
            返回首页
          </Link>
          <Link
            href="/tools"
            className="btn btn-outline"
          >
            浏览工具
          </Link>
        </div>
      </div>
    </div>
  );
}
