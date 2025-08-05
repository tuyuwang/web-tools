/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // 启用实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Webpack 优化
  webpack: (config, { dev, isServer }) => {
    // 生产环境优化
    if (!dev && !isServer) {
      // 启用代码分割
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide',
            chunks: 'all',
            priority: 20,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
          },
        },
      };
    }
    
    return config;
  },
  // 压缩选项
  compress: true,
  // 启用 SWC minify
  swcMinify: true,
  // 环境变量
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // 重写规则（静态导出时不会生效，但保留配置）
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://your-feedback-domain.vercel.app/api/:path*',
      },
    ];
  },
  // 性能预算
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // 禁用 x-powered-by 头
  poweredByHeader: false,
  // 启用 React 严格模式
  reactStrictMode: true,
  // ESLint 配置
  eslint: {
    dirs: ['src'],
  },
  // TypeScript 配置
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
};

module.exports = nextConfig; 