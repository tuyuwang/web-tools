import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import { MetadataProvider } from '@/components/metadata-provider';
import ServiceWorkerRegister from '@/components/sw-register';
import { PWAInstaller } from '@/components/pwa-installer';
import { Analytics } from '@/components/analytics';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
};

export const metadata: Metadata = {
  title: '工具集 - 高效实用的在线工具',
  description: '提供文本处理、图片编辑、开发工具等实用功能的在线工具网站，快速、安全、免费使用。',
  keywords: '在线工具,文本处理,图片编辑,开发工具,实用工具',
  authors: [{ name: '工具集团队' }],
  creator: '工具集',
  publisher: '工具集',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tools.example.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '工具集 - 高效实用的在线工具',
    description: '提供文本处理、图片编辑、开发工具等实用功能的在线工具网站',
    url: 'https://tools.example.com',
    siteName: '工具集',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '工具集',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '工具集 - 高效实用的在线工具',
    description: '提供文本处理、图片编辑、开发工具等实用功能的在线工具网站',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '工具集',
  },

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <MetadataProvider />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navigation />
              <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {children}
              </main>
            </div>
            <ServiceWorkerRegister />
            <PWAInstaller />
            <Analytics />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
