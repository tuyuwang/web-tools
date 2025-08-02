const fs = require('fs');
const path = require('path');

// 创建图标目录
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 生成SVG图标内容
function generateSVGIcon(size, text = '工具') {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6" rx="16"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold">${text}</text>
</svg>`;
}

// 生成不同尺寸的图标
const iconSizes = [
  { size: 72, text: '工具' },
  { size: 96, text: '工具' },
  { size: 128, text: '工具' },
  { size: 144, text: '工具' },
  { size: 152, text: '工具' },
  { size: 192, text: '工具' },
  { size: 384, text: '工具' },
  { size: 512, text: '工具' }
];

// 生成功能图标
const featureIcons = [
  { name: 'text', text: '文本' },
  { name: 'image', text: '图片' },
  { name: 'dev', text: '开发' }
];

console.log('生成PWA图标...');

// 生成主图标
iconSizes.forEach(({ size, text }) => {
  const svgContent = generateSVGIcon(size, text);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svgContent);
  console.log(`✓ 生成图标: icon-${size}x${size}.svg`);
});

// 生成功能图标
featureIcons.forEach(({ name, text }) => {
  const svgContent = generateSVGIcon(96, text);
  const filePath = path.join(iconsDir, `${name}-96x96.svg`);
  fs.writeFileSync(filePath, svgContent);
  console.log(`✓ 生成功能图标: ${name}-96x96.svg`);
});

console.log('图标生成完成！');
console.log('注意：这些是SVG格式的占位符图标。');
console.log('在生产环境中，建议使用专业的PNG图标。'); 