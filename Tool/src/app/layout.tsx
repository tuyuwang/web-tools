import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import { MetadataProvider } from '@/components/metadata-provider';
import { SWRegister } from '@/components/sw-register';
import { PWAInstaller } from '@/components/pwa-installer';
import { Analytics } from '@/components/analytics';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  title: {
    default: '工具集 - 高效实用的在线工具网站',
    template: '%s | 工具集',
  },
  description: '提供文本处理、图片编辑、开发工具、密码生成器、颜色选择器等20+实用功能的在线工具网站。免费、快速、安全，支持PWA离线使用。',
  keywords: [
    '在线工具',
    '文本处理',
    '图片编辑',
    '开发工具',
    '密码生成器',
    '颜色选择器',
    '实用工具',
    'PWA',
    '离线工具',
    '免费工具'
  ],
  authors: [{ name: '工具集团队', url: 'https://tools.example.com' }],
  creator: '工具集',
  publisher: '工具集',
  category: 'Technology',
  classification: 'Online Tools',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tools.example.com'),
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/',
      'en': '/en',
    },
  },
  openGraph: {
    title: '工具集 - 高效实用的在线工具网站',
    description: '提供20+实用在线工具，包括文本处理、图片编辑、开发工具等。免费使用，支持PWA离线功能。',
    url: '/',
    siteName: '工具集',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '工具集 - 在线工具网站',
        type: 'image/png',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '工具集 - 高效实用的在线工具网站',
    description: '提供20+实用在线工具，免费使用，支持PWA离线功能',
    images: ['/og-image.png'],
    creator: '@toolswebsite',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_CODE,
    yandex: process.env.YANDEX_VERIFICATION_CODE,
    yahoo: process.env.YAHOO_VERIFICATION_CODE,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '工具集',
    startupImage: [
      {
        url: '/apple-touch-startup-image-768x1004.png',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },
  applicationName: '工具集',
  referrer: 'origin-when-cross-origin',
  generator: 'Next.js',
  abstract: '高效实用的在线工具集合网站',
  archives: ['/sitemap.xml'],
  assets: ['/favicon.ico', '/manifest.json'],
  bookmarks: ['/'],
  category: 'productivity',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <head>
        {/* 预加载关键资源 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS预解析 */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: '工具集',
              description: '提供20+实用在线工具的网站',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://tools.example.com',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'CNY',
              },
              author: {
                '@type': 'Organization',
                name: '工具集团队',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '1250',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* 跳转到主内容的链接，用于屏幕阅读器 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 transition-all"
        >
          跳转到主内容
        </a>
        
        <ThemeProvider>
          <LanguageProvider>
            <MetadataProvider />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
              {/* 页面头部导航 */}
              <header role="banner">
                <Navigation />
              </header>
              
              {/* 主要内容区域 */}
              <main 
                id="main-content"
                role="main"
                className="flex-1 container-responsive py-6 sm:py-8"
                tabIndex={-1}
              >
                {children}
              </main>
              
              {/* 页面底部 */}
              <footer 
                role="contentinfo"
                className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <div className="container-responsive py-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        工具集
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        提供高效实用的在线工具，包括文本处理、图片编辑、开发工具等。
                        所有工具均可免费使用，支持PWA离线功能。
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        热门工具
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <a 
                            href="/tools/text/case" 
                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            文本格式转换
                          </a>
                        </li>
                        <li>
                          <a 
                            href="/tools/dev/color" 
                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            颜色选择器
                          </a>
                        </li>
                        <li>
                          <a 
                            href="/tools/utility/password" 
                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            密码生成器
                          </a>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        关于
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <a 
                            href="/about" 
                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            关于我们
                          </a>
                        </li>
                        <li>
                          <a 
                            href="/privacy" 
                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            隐私政策
                          </a>
                        </li>
                        <li>
                          <a 
                            href="/terms" 
                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            使用条款
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        © 2024 工具集. 保留所有权利.
                      </p>
                      <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Made with ❤️ by 工具集团队
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
            
            {/* PWA和分析组件 */}
            <SWRegister />
            <PWAInstaller />
            <Analytics />
          </LanguageProvider>
        </ThemeProvider>
        
        {/* 无障碍功能增强 */}
        <div 
          id="announcements" 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        />
      </body>
    </html>
  );
}
