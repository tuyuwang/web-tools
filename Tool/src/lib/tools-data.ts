export interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string; // 改为字符串，存储图标名称
  category: string;
  popular?: boolean;
}

export const tools: Tool[] = [
  // AI工具
  {
    id: 'ai-text-generator',
    name: '文本生成器',
    description: '生成Lorem ipsum、假数据、随机文本等，支持多种生成类型。',
    href: '/tools/ai/text-generator',
    icon: 'MessageSquare',
    category: 'ai',
    popular: true,
  },
  {
    id: 'ai-language-detect',
    name: '语言检测',
    description: '自动识别文本的语言类型，支持中英日韩法德西俄阿等多种语言。',
    href: '/tools/ai/language-detect',
    icon: 'Brain',
    category: 'ai',
    popular: true,
  },
  {
    id: 'ai-keyword-extract',
    name: '关键词提取',
    description: '从文本中智能提取关键词和短语，提供频率统计和重要性评分。',
    href: '/tools/ai/keyword-extract',
    icon: 'Hash',
    category: 'ai',
    popular: true,
  },
  {
    id: 'ai-text-summary',
    name: '智能摘要',
    description: '提取文本关键信息，生成简洁摘要（即将推出）。',
    href: '/tools/ai/text-summary',
    icon: 'Sparkles',
    category: 'ai',
    popular: false,
  },
  {
    id: 'ai-sentiment-analysis',
    name: '情感分析',
    description: '分析文本的情感倾向和语调（即将推出）。',
    href: '/tools/ai/sentiment-analysis',
    icon: 'TrendingUp',
    category: 'ai',
    popular: false,
  },
  {
    id: 'text-case',
    name: '文本格式转换',
    description: '快速转换文本大小写、驼峰命名等格式，支持9种常用格式。',
    href: '/tools/text/case',
    icon: 'TextCursorInput',
    category: 'text',
    popular: true,
  },
  {
    id: 'text-encode',
    name: '编码解码工具',
    description: 'Base64、URL、HTML等编码解码工具，支持多种格式转换。',
    href: '/tools/text/encode',
    icon: 'Code',
    category: 'text',
    popular: false,
  },
  {
    id: 'text-regex',
    name: '正则表达式测试',
    description: '在线测试和调试正则表达式，实时查看匹配结果。',
    href: '/tools/text/regex',
    icon: 'FileText',
    category: 'text',
    popular: true,
  },
  {
    id: 'text-analyze',
    name: '文本分析工具',
    description: '分析文本的字符数、词数、行数等统计信息。',
    href: '/tools/text/analyze',
    icon: 'FileText',
    category: 'text',
    popular: false,
  },
  {
    id: 'text-compare',
    name: '文本比较工具',
    description: '比较两段文本的差异，支持忽略大小写和空白字符。',
    href: '/tools/text/compare',
    icon: 'FileText',
    category: 'text',
    popular: false,
  },
  {
    id: 'text-deduplicate',
    name: '文本去重工具',
    description: '去除重复的文本行，支持多种去重模式。',
    href: '/tools/text/deduplicate',
    icon: 'FileText',
    category: 'text',
    popular: false,
  },
  {
    id: 'text-stats',
    name: '文本统计工具',
    description: '统计文本的字符、单词、行数等详细信息。',
    href: '/tools/text/stats',
    icon: 'FileText',
    category: 'text',
    popular: false,
  },
  {
    id: 'image-compress',
    name: '图片压缩工具',
    description: '在线压缩图片，优化图片大小，支持质量调节。',
    href: '/tools/image/compress',
    icon: 'Image',
    category: 'image',
    popular: true,
  },
      {
      id: 'image-convert',
      name: '图片格式转换',
      description: '基于Canvas API的真实图片格式转换，支持主流格式间的高质量转换。',
      href: '/tools/image/convert',
    icon: 'Image',
    category: 'image',
    popular: false,
  },
  {
    id: 'image-watermark',
    name: '水印添加工具',
    description: '为图片添加文字水印，支持自定义位置、颜色、透明度等。',
    href: '/tools/image/watermark',
    icon: 'Image',
    category: 'image',
    popular: false,
  },
  {
    id: 'image-resize',
    name: '图片尺寸调整',
    description: '调整图片尺寸，支持保持比例、批量处理等功能。',
    href: '/tools/image/resize',
    icon: 'Image',
    category: 'image',
    popular: false,
  },
  {
    id: 'image-filter',
    name: '图片滤镜工具',
    description: '为图片添加各种滤镜效果，支持亮度、对比度、饱和度调节。',
    href: '/tools/image/filter',
    icon: 'Image',
    category: 'image',
    popular: false,
  },
  {
    id: 'dev-format',
    name: '代码格式化',
    description: '格式化JavaScript、JSON、CSS等代码，使其更易读。',
    href: '/tools/dev/format',
    icon: 'Code',
    category: 'dev',
    popular: true,
  },
  {
    id: 'dev-json',
    name: 'JSON工具',
    description: '格式化、验证、压缩JSON数据，支持自定义缩进。',
    href: '/tools/dev/json',
    icon: 'Code',
    category: 'dev',
    popular: false,
  },
  {
    id: 'dev-color',
    name: '颜色选择器',
    description: '选择颜色并获取多种格式的颜色值，支持RGB、HSL、HEX等格式。',
    href: '/tools/dev/color',
    icon: 'Palette',
    category: 'dev',
    popular: true,
  },
  {
    id: 'dev-api',
    name: 'API测试工具',
    description: '测试API接口，发送HTTP请求并查看响应结果。',
    href: '/tools/dev/api',
    icon: 'Send',
    category: 'dev',
    popular: true,
  },
  {
    id: 'dev-timestamp',
    name: '时间戳转换',
    description: '时间戳与日期时间相互转换，支持多种格式。',
    href: '/tools/dev/timestamp',
    icon: 'Clock',
    category: 'dev',
    popular: false,
  },
  {
    id: 'utility-qr',
    name: '二维码生成器',
    description: '生成自定义二维码，支持文本和URL，可下载使用。',
    href: '/tools/utility/qr',
    icon: 'QrCode',
    category: 'utility',
    popular: true,
  },
  {
    id: 'utility-password',
    name: '密码生成器',
    description: '生成安全、随机的密码，支持自定义长度和字符类型。',
    href: '/tools/utility/password',
    icon: 'Shield',
    category: 'utility',
    popular: false,
  },
  {
    id: 'utility-calculator',
    name: '计算器',
    description: '基础计算器，支持加减乘除等基本运算。',
    href: '/tools/utility/calculator',
    icon: 'Calculator',
    category: 'utility',
    popular: false,
  },
  {
    id: 'utility-color-picker',
    name: '颜色选择器',
    description: '选择颜色并获取多种格式的颜色值。',
    href: '/tools/utility/color-picker',
    icon: 'Palette',
    category: 'utility',
    popular: false,
  },
  {
    id: 'utility-converter',
    name: '单位转换器',
    description: '转换长度、重量、温度等各种单位。',
    href: '/tools/utility/converter',
    icon: 'Calculator',
    category: 'utility',
    popular: false,
  },
  {
    id: 'utility-data-generator',
    name: '数据生成器',
    description: '生成测试数据，支持多种格式和类型。',
    href: '/tools/utility/data-generator',
    icon: 'FileText',
    category: 'utility',
    popular: false,
  },
  {
    id: 'utility-file-converter',
    name: '文件转换器',
    description: '转换各种文件格式，支持文档、图片等。',
    href: '/tools/utility/file-converter',
    icon: 'FileText',
    category: 'utility',
    popular: false,
  },
  {
    id: 'utility-network-tools',
    name: '网络工具',
    description: 'IP查询、端口扫描等网络相关工具。',
    href: '/tools/utility/network-tools',
    icon: 'Send',
    category: 'utility',
    popular: false,
  },
  {
    id: 'utility-random',
    name: '随机数生成器',
    description: '生成随机数、随机字符串等。',
    href: '/tools/utility/random',
    icon: 'Calculator',
    category: 'utility',
    popular: false,
  },
  {
    id: 'utility-time-calculator',
    name: '时间计算器',
    description: '计算时间差、日期加减等时间相关计算。',
    href: '/tools/utility/time-calculator',
    icon: 'Clock',
    category: 'utility',
    popular: false,
  },
  {
    id: 'utility-unit-converter',
    name: '单位转换器',
    description: '转换各种物理单位，支持长度、重量、温度等。',
    href: '/tools/utility/unit-converter',
    icon: 'Calculator',
    category: 'utility',
    popular: false,
  },
  {
    id: 'learn-calculator',
    name: '数学公式计算器',
    description: '支持复杂数学计算、科学计算、三角函数等。',
    href: '/tools/learn/calculator',
    icon: 'Calculator',
    category: 'learn',
    popular: true,
  },
  {
    id: 'learn-cheatsheet',
    name: '速查表工具',
    description: '提供CSS、正则表达式、常用命令等速查功能。',
    href: '/tools/learn/cheatsheet',
    icon: 'BookOpen',
    category: 'learn',
    popular: false,
  },
  {
    id: 'learn-notes',
    name: '笔记工具',
    description: '在线笔记工具，支持Markdown格式。',
    href: '/tools/learn/notes',
    icon: 'FileText',
    category: 'learn',
    popular: false,
  },
  {
    id: 'learn-progress',
    name: '学习进度跟踪',
    description: '跟踪学习进度，设置目标和里程碑。',
    href: '/tools/learn/progress',
    icon: 'BookOpen',
    category: 'learn',
    popular: false,
  },
  {
    id: 'health-bmi',
    name: 'BMI计算器',
    description: '计算身体质量指数，评估健康状态。',
    href: '/tools/health/bmi',
    icon: 'Calculator',
    category: 'health',
    popular: false,
  },
  {
    id: 'health-calorie',
    name: '卡路里计算器',
    description: '计算每日所需卡路里，制定饮食计划。',
    href: '/tools/health/calorie',
    icon: 'Calculator',
    category: 'health',
    popular: false,
  },
  {
    id: 'media',
    name: '媒体工具',
    description: '音频、视频处理工具集合。',
    href: '/tools/media',
    icon: 'FileText',
    category: 'media',
    popular: false,
  },
  {
    id: 'office',
    name: '办公工具',
    description: '文档处理、表格工具等办公相关工具。',
    href: '/tools/office',
    icon: 'FileText',
    category: 'office',
    popular: false,
  },
  {
    id: 'security',
    name: '安全工具',
    description: '密码强度检测、加密解密等安全工具。',
    href: '/tools/security',
    icon: 'Shield',
    category: 'security',
    popular: false,
  },
];

export const categories = [
  { id: 'all', name: '全部' },
  { id: 'ai', name: 'AI工具' },
  { id: 'text', name: '文本工具' },
  { id: 'image', name: '图片工具' },
  { id: 'dev', name: '开发工具' },
  { id: 'utility', name: '实用工具' },
  { id: 'learn', name: '学习工具' },
  { id: 'health', name: '健康工具' },
  { id: 'media', name: '媒体工具' },
  { id: 'office', name: '办公工具' },
  { id: 'security', name: '安全工具' },
];

// 根据路径获取工具信息
export function getToolByPath(path: string): Tool | null {
  // 标准化路径：移除末尾斜杠
  const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
  
  // 精确匹配
  const exactMatch = tools.find(tool => tool.href === normalizedPath);
  if (exactMatch) return exactMatch;
  
  // 如果精确匹配失败，尝试模糊匹配（移除开头的斜杠）
  const pathWithoutLeadingSlash = normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath;
  const toolWithoutLeadingSlash = tools.find(tool => {
    const toolPath = tool.href.startsWith('/') ? tool.href.slice(1) : tool.href;
    return toolPath === pathWithoutLeadingSlash;
  });
  
  return toolWithoutLeadingSlash || null;
}

// 根据工具ID获取工具信息
export function getToolById(id: string): Tool | null {
  return tools.find(tool => tool.id === id) || null;
}

// 获取所有工具名称（用于反馈选择）
export function getAllToolNames(): { id: string; name: string }[] {
  return tools.map(tool => ({ id: tool.id, name: tool.name }));
} 