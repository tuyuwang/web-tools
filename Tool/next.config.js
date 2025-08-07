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
    // 启用 Turbo 模式
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Webpack 优化
  webpack: (config, { dev, isServer }) => {
    // 生产环境优化
    if (!dev && !isServer) {
      // 启用更细粒度的代码分割
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 200000, // 减小最大大小
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        automaticNameDelimiter: '-',
        cacheGroups: {
          // 分离React相关
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // 分离图标库 - 更细粒度
          lucideCore: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]dist[\\/]esm[\\/]lucide-react\.js/,
            name: 'lucide-core',
            chunks: 'all',
            priority: 35,
          },
          lucideIcons: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]dist[\\/]esm[\\/]icons[\\/]/,
            name: 'lucide-icons',
            chunks: 'async',
            priority: 30,
          },
          // 分离Supabase
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 25,
          },
          // 分离其他工具库
          utils: {
            test: /[\\/]node_modules[\\/](qrcode|critters)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 20,
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
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
      
      // 优化模块解析
      config.resolve.alias = {
        ...config.resolve.alias,
        // 使用ES模块版本
        'lucide-react': 'lucide-react/dist/esm/lucide-react.js',
      };

      // 添加缓存配置
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    // 添加性能监控
    config.plugins.push(
      new (require('webpack').DefinePlugin)({
        __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
        __BUNDLE_ANALYZER__: JSON.stringify(process.env.ANALYZE === 'true'),
      })
    );
    
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
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
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
    // 启用 React 编译器优化
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  // 生产环境优化
  productionBrowserSourceMaps: false,
  // 优化字体加载
  optimizeFonts: true,
  // 静态优化指示器
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  // 页面扩展名
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // 添加安全头
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig; 