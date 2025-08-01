/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用压缩
  compress: true,
  
  // 优化图片
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // 实验性功能
  experimental: {
    // 启用SWC压缩
    swcMinify: true,
    // 优化包大小
    optimizePackageImports: ['lucide-react'],
  },
  
  // 输出配置
  output: 'standalone',
  
  // 禁用开发工具
  productionBrowserSourceMaps: false,
  
  // 优化webpack配置
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // 生产环境优化
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig 