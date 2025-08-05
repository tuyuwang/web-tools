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
        maxSize: 200000, // 减小最大chunk大小
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
            chunks: 'async', // 改为异步加载
            priority: 25,
          },
          // 分离Supabase
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'async', // 改为异步加载
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

      // 添加bundle分析
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: '../bundle-analysis-report.html',
          })
        );
      }
    }
    
    // 忽略不必要的文件
    config.ignoreWarnings = [
      {
        module: /node_modules/,
      },
      {
        message: /Critical dependency/,
      },
    ];

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
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
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
    ignoreDuringBuilds: false,
  },
  // TypeScript 配置
  typescript: {
    tsconfigPath: './tsconfig.json',
    ignoreBuildErrors: false,
  },
  // 添加性能监控
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: false, // 如果不使用styled-components可以禁用
  },
  // 静态优化
  generateEtags: false,
  // 页面扩展名
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // 优化字体加载
  optimizeFonts: true,
  // 模块转译
  transpilePackages: ['lucide-react'],
};

module.exports = nextConfig; 