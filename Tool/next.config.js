/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态站点导出配置
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // 图片优化配置
  images: {
    unoptimized: true,
    loader: 'custom',
    loaderFile: './src/lib/image-loader.js',
  },
  
  // 静态生成优化
  generateEtags: false,
  
  // 启用实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
    optimizeCss: true,
    // 静态站点不支持PPR
    ppr: false,
    // 启用更多优化
    optimizeServerReact: true,
    serverMinification: true,
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
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
      
      // 优化模块解析
      config.resolve.alias = {
        ...config.resolve.alias,
        // 使用ES模块版本
        'lucide-react': 'lucide-react/dist/esm/lucide-react.js',
      };

      // 静态资源优化
      config.module.rules.push({
        test: /\.(png|jpe?g|gif|svg|webp|ico)$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/images/',
            outputPath: 'static/images/',
            name: '[name].[hash].[ext]',
          },
        },
      });
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
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://tools.example.com',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
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
  
  // 编译器优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // 移除React DevTools
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    // 优化样式
    styledComponents: false,
  },
  
  // 静态页面生成配置
  async generateBuildId() {
    // 使用时间戳作为构建ID，确保每次构建都是唯一的
    return `build-${Date.now()}`;
  },
  
  // 页面扩展配置
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // 静态文件配置
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.ASSET_PREFIX || '' : '',
  
  // 基础路径配置（如果部署在子路径）
  basePath: process.env.BASE_PATH || '',
  
  // 严格模式
  strictMode: true,
  
  // 输出文件跟踪
  outputFileTracing: false, // 静态导出不需要
  
  // 静态优化指示器
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
};

module.exports = nextConfig; 