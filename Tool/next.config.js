/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // 启用实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
    // 启用更激进的优化
    optimizeCss: true,
    // 启用部分预渲染
    ppr: false,
  },
  // Webpack 优化
  webpack: (config, { dev, isServer }) => {
    // 生产环境优化
    if (!dev && !isServer) {
      // 启用更细粒度的代码分割
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          // 分离React相关
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 30,
          },
          // 分离图标库
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide',
            chunks: 'all',
            priority: 25,
          },
          // 分离Supabase
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 25,
          },
          // 分离其他vendor
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          // 分离共用代码
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };

      // 启用更多优化
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // 优化模块解析
      config.resolve.alias = {
        ...config.resolve.alias,
        // 使用ES模块版本
        'lucide-react': 'lucide-react/dist/esm/lucide-react.js',
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
  // 添加性能监控
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig; 