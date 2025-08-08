import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "反馈管理系统",
  description: "管理和分析用户反馈数据",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* 导航栏 */}
          <nav className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    反馈管理系统
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <a
                    href="/"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    首页
                  </a>
                  <a
                    href="/admin/feedback"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    反馈管理
                  </a>
                  <a
                    href="/tools/roi"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    投资回报计算器
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* 主内容 */}
          <main className="flex-1">
            {children}
          </main>

          {/* 页脚 */}
          <footer className="bg-white border-t mt-12">
            <div className="container mx-auto px-4 py-6">
              <div className="text-center text-gray-600 text-sm">
                <p>© 2024 反馈管理系统. 保留所有权利.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
