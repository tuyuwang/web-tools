/**
 * 自定义图片加载器 - 用于静态站点优化
 */

export default function imageLoader({ src, width, quality }) {
  // 对于静态站点，直接返回原始路径
  if (src.startsWith('http') || src.startsWith('//')) {
    return src;
  }
  
  // 本地图片路径处理
  const params = new URLSearchParams();
  
  if (width) {
    params.set('w', width.toString());
  }
  
  if (quality) {
    params.set('q', quality.toString());
  }
  
  const paramsString = params.toString();
  
  // 如果有参数，可以在这里集成图片优化服务
  // 例如：返回优化后的图片URL
  if (paramsString) {
    // 这里可以集成 Cloudinary, ImageKit 等服务
    // return `https://your-image-service.com${src}?${paramsString}`;
  }
  
  return src;
}