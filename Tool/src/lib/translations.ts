import type { Locale } from './i18n';

export interface Translations {
  // 网站元数据
  metadata: {
    title: string;
    description: string;
    keywords: string;
    siteName: string;
  };
  
  // 导航
  nav: {
    home: string;
    tools: string;
  };
  
  // 首页
  home: {
    hero: {
      title: string;
      subtitle: string;
      cta: {
        start: string;
        learnMore: string;
      };
    };
    features: {
      title: string;
      items: {
        fast: {
          title: string;
          description: string;
        };
        secure: {
          title: string;
          description: string;
        };
        free: {
          title: string;
          description: string;
        };
      };
    };
  };
  
  // 工具列表页面
  tools: {
    title: string;
    subtitle: string;
    search: {
      placeholder: string;
      filter?: string;
      clearFilter?: string;
      found?: string;
      toolsCount?: string;
      clearAllFilters?: string;
    };
          categories: {
        all: string;
        ai: string;
        text: string;
        image: string;
        dev: string;
        utility: string;
        learn: string;
        health: string;
        media: string;
        office: string;
        security: string;
      };
    popular: string;
    noResults: {
      title: string;
      description: string;
    };
  };
  
  // 工具名称和描述翻译
  toolNames: {
    // AI工具
    'ai-text-generator': string;
    'ai-language-detect': string;
    'ai-keyword-extract': string;
    'ai-text-summary': string;
    'ai-sentiment-analysis': string;
    // 文本工具
    'text-case': string;
    'text-encode': string;
    'text-regex': string;
    'text-analyze': string;
    'text-compare': string;
    'text-deduplicate': string;
    'text-stats': string;
    // 图片工具
    'image-compress': string;
    'image-convert': string;
    'image-watermark': string;
    'image-resize': string;
    'image-filter': string;
    // 开发工具
    'dev-format': string;
    'dev-json': string;
    'dev-color': string;
    'dev-api': string;
    'dev-timestamp': string;
    // 实用工具
    'utility-qr': string;
    'utility-password': string;
    'utility-calculator': string;
    'utility-color-picker': string;
    'utility-converter': string;
    'utility-data-generator': string;
    'utility-file-converter': string;
    'utility-network-tools': string;
    'utility-random': string;
    'utility-time-calculator': string;
    'utility-unit-converter': string;
    // 学习工具
    'learn-calculator': string;
    'learn-cheatsheet': string;
    'learn-notes': string;
    'learn-progress': string;
    // 健康工具
    'health-bmi': string;
    'health-calorie': string;
    'utility-browser-info': string;
    'utility-pomodoro-timer': string;
    'utility-speed-test': string;
    'utility-gps-coordinates': string;
    'utility-compound-calculator': string;
    // 文本工具 - 新增
    'text-character-counter': string;
    'text-markdown-editor': string;
    // 开发工具 - 新增
    'dev-gradient-generator': string;
    'dev-image-to-base64': string;
    // 媒体、办公、安全工具
    'media-player': string;
    'office-document-processor': string;
    'security-tools': string;
    'security-password-strength': string;
  };
  
  toolDescriptions: {
    // AI工具
    'ai-text-generator': string;
    'ai-language-detect': string;
    'ai-keyword-extract': string;
    'ai-text-summary': string;
    'ai-sentiment-analysis': string;
    // 文本工具
    'text-case': string;
    'text-encode': string;
    'text-regex': string;
    'text-analyze': string;
    'text-compare': string;
    'text-deduplicate': string;
    'text-stats': string;
    // 图片工具
    'image-compress': string;
    'image-convert': string;
    'image-watermark': string;
    'image-resize': string;
    'image-filter': string;
    // 开发工具
    'dev-format': string;
    'dev-json': string;
    'dev-color': string;
    'dev-api': string;
    'dev-timestamp': string;
    // 实用工具
    'utility-qr': string;
    'utility-password': string;
    'utility-calculator': string;
    'utility-color-picker': string;
    'utility-converter': string;
    'utility-data-generator': string;
    'utility-file-converter': string;
    'utility-network-tools': string;
    'utility-random': string;
    'utility-time-calculator': string;
    'utility-unit-converter': string;
    // 学习工具
    'learn-calculator': string;
    'learn-cheatsheet': string;
    'learn-notes': string;
    'learn-progress': string;
    // 健康工具
    'health-bmi': string;
    'health-calorie': string;
    'utility-browser-info': string;
    'utility-pomodoro-timer': string;
    'utility-speed-test': string;
    'utility-gps-coordinates': string;
    'utility-compound-calculator': string;
    // 文本工具 - 新增
    'text-character-counter': string;
    'text-markdown-editor': string;
    // 开发工具 - 新增
    'dev-gradient-generator': string;
    'dev-image-to-base64': string;
    // 媒体、办公、安全工具
    'media-player': string;
    'office-document-processor': string;
    'security-tools': string;
    'security-password-strength': string;
  };
  
  // 工具详情页面
  toolDetails: {
    // 文本工具
    textCase: {
      title: string;
      description: string;
      features: string[];
    };
    textEncode: {
      title: string;
      description: string;
      features: string[];
    };
    textRegex: {
      title: string;
      description: string;
      features: string[];
    };
    // 图片工具
    imageCompress: {
      title: string;
      description: string;
      features: string[];
    };
    imageConvert: {
      title: string;
      description: string;
      features: string[];
    };
    imageWatermark: {
      title: string;
      description: string;
      features: string[];
    };
    // 实用工具
    qrGenerator: {
      title: string;
      description: string;
      features: string[];
    };
    passwordGenerator: {
      title: string;
      description: string;
      features: string[];
    };
          calculator: {
        title: string;
        description: string;
        features: string[];
        display: string;
        clear: string;
        operations: {
          add: string;
          subtract: string;
          multiply: string;
          divide: string;
          percentage: string;
          plusMinus: string;
        };
        instructions: {
          step1: string;
          step2: string;
          step3: string;
          step4: string;
        };
      };
    randomGenerator: {
      title: string;
      description: string;
      features: string[];
    };
  };
  
  // 通用UI元素
  ui: {
    // 按钮
    buttons: {
      copy: string;
      clear: string;
      generate: string;
      download: string;
      regenerate: string;
      save: string;
      cancel: string;
      confirm: string;
      reset: string;
      apply: string;
      submit: string;
      close: string;
    };
    // 标签
    labels: {
      input: string;
      output: string;
      result: string;
      settings: string;
      options: string;
      configuration: string;
      parameters: string;
      format: string;
      size: string;
      quality: string;
      length: string;
      type: string;
      category: string;
      status: string;
      progress: string;
    };
    // 占位符
    placeholders: {
      enterText: string;
      enterUrl: string;
      enterNumber: string;
      selectOption: string;
      chooseFile: string;
      inputData: string;
      searchTools: string;
      enterContent: string;
    };
    // 提示信息
    messages: {
      loading: string;
      processing: string;
      success: string;
      error: string;
      warning: string;
      info: string;
      copied: string;
      saved: string;
      generated: string;
      converted: string;
      uploaded: string;
      downloaded: string;
    };
    // 状态
    status: {
      ready: string;
      processing: string;
      completed: string;
      failed: string;
      pending: string;
      active: string;
      inactive: string;
      enabled: string;
      disabled: string;
    };
    // 强度等级
    strength: {
      veryWeak: string;
      weak: string;
      medium: string;
      strong: string;
      veryStrong: string;
      extremelyStrong: string;
      none: string;
    };
  };
  
  // 工具页面特定翻译
  toolPages: {
    // 文本格式转换
    textCase: {
      inputText: string;
      outputText: string;
      conversionOptions: string;
      instructions: string;
      caseTypes: {
        uppercase: { name: string; description: string };
        lowercase: { name: string; description: string };
        capitalize: { name: string; description: string };
        titlecase: { name: string; description: string };
        alternating: { name: string; description: string };
        inverse: { name: string; description: string };
      };
      instructionSteps: {
        step1: string;
        step2: string;
        step3: string;
        step4: string;
        step5: string;
      };
    };
    // 二维码生成器
    qrGenerator: {
      inputContent: string;
      qrCodeSize: string;
      errorCorrectionLevel: string;
      quickInput: string;
      generatedQrCode: string;
      errorLevels: {
        low: { label: string; description: string };
        medium: { label: string; description: string };
        high: { label: string; description: string };
        highest: { label: string; description: string };
      };
      sampleTexts: {
        url: string;
        text: string;
        email: string;
        phone: string;
        wifi: string;
      };
      instructionSteps: {
        step1: string;
        step2: string;
        step3: string;
        step4: string;
        step5: string;
      };
    };
    // 密码生成器
    passwordGenerator: {
      generationSettings: string;
      passwordLength: string;
      characterTypes: string;
      generatedPassword: string;
      passwordStrength: string;
      securityTips: string;
      characterOptions: {
        uppercase: string;
        lowercase: string;
        numbers: string;
        symbols: string;
        excludeSimilar: string;
      };
      securityTipsList: {
        tip1: string;
        tip2: string;
        tip3: string;
        tip4: string;
        tip5: string;
      };
    };
    // 计算器
    calculator: {
      title: string;
      description: string;
      display: string;
      clear: string;
      operations: {
        add: string;
        subtract: string;
        multiply: string;
        divide: string;
        percentage: string;
        plusMinus: string;
      };
      instructions: {
        step1: string;
        step2: string;
        step3: string;
        step4: string;
      };
    };
    // 媒体工具
    mediaTools: {
      title: string;
      description: string;
      tabs: {
        audio: string;
        video: string;
        converter: string;
      };
      audioFormats: {
        mp3: { name: string; description: string };
        wav: { name: string; description: string };
        aac: { name: string; description: string };
        ogg: { name: string; description: string };
        flac: { name: string; description: string };
      };
      videoFormats: {
        mp4: { name: string; description: string };
        avi: { name: string; description: string };
        mov: { name: string; description: string };
        webm: { name: string; description: string };
        mkv: { name: string; description: string };
      };
      controls: {
        play: string;
        pause: string;
        volume: string;
        mute: string;
        download: string;
        upload: string;
      };
      instructions: {
        step1: string;
        step2: string;
        step3: string;
        step4: string;
      };
    };
    // 办公工具
    officeTools: {
      title: string;
      description: string;
      documentProcessing: string;
      csvJsonConverter: string;
      tableGenerator: string;
      batchTextProcessing: string;
      features: {
        caseConversion: string;
        formatCleaning: string;
        csvToJson: string;
        jsonToCsv: string;
        tableCreation: string;
        batchProcessing: string;
      };
      instructions: {
        step1: string;
        step2: string;
        step3: string;
        step4: string;
      };
    };
    // 安全工具
    securityTools: {
      title: string;
      description: string;
      hashTools: string;
      encryptionTools: string;
      passwordStrength: string;
      sslChecker: string;
      features: {
        md5: string;
        sha1: string;
        sha256: string;
        caesarCipher: string;
        base64: string;
        sslValidation: string;
      };
      instructions: {
        step1: string;
        step2: string;
        step3: string;
        step4: string;
      };
    };
    // BMI计算器
    bmiCalculator: {
      title: string;
      description: string;
      height: string;
      weight: string;
      calculate: string;
      result: string;
      bmiCategories: {
        underweight: { range: string; status: string; description: string };
        normal: { range: string; status: string; description: string };
        overweight: { range: string; status: string; description: string };
        obese: { range: string; status: string; description: string };
      };
      instructions: {
        step1: string;
        step2: string;
        step3: string;
        step4: string;
      };
    };
    // 卡路里计算器
    calorieCalculator: {
      title: string;
      description: string;
      personalInfo: string;
      activityLevel: string;
      goal: string;
      calculate: string;
      result: string;
      activityLevels: {
        sedentary: { name: string; description: string };
        lightlyActive: { name: string; description: string };
        moderatelyActive: { name: string; description: string };
        veryActive: { name: string; description: string };
        extremelyActive: { name: string; description: string };
      };
      goals: {
        lose: string;
        maintain: string;
        gain: string;
      };
      instructions: {
        step1: string;
        step2: string;
        step3: string;
        step4: string;
      };
    };
  };
  
  // 通用
  common: {
    loading: string;
    error: string;
    success: string;
    encode: string;
    decode: string;
    copy: string;
    clear: string;
  };
  
  // 主题切换
  theme: {
    light: string;
    dark: string;
    system: string;
  };
}

export const translations: Record<Locale, Translations> = {
  'zh-CN': {
    metadata: {
      title: '工具集 - 高效实用的在线工具',
      description: '提供文本处理、图片编辑、开发工具等实用功能的在线工具网站，快速、安全、免费使用。',
      keywords: '在线工具,文本处理,图片编辑,开发工具,实用工具',
      siteName: '工具集',
    },
    nav: {
      home: '首页',
      tools: '工具',
    },
    home: {
      hero: {
        title: '高效实用的在线工具',
        subtitle: '提供文本处理、图片编辑、开发工具等实用功能，让您的工作更简单、更高效。无需注册，免费使用，保护隐私。',
        cta: {
          start: '开始使用',
          learnMore: '了解更多',
        },
      },
      features: {
        title: '核心特性',
        items: {
          fast: {
            title: '快速高效',
            description: '所有工具都在浏览器中运行，无需上传文件，保护您的隐私。',
          },
          secure: {
            title: '安全可靠',
            description: '客户端处理，数据不会上传到服务器，确保您的信息安全。',
          },
          free: {
            title: '免费使用',
            description: '所有工具完全免费，无需注册，无广告干扰，专注用户体验。',
          },
        },
      },
    },
    tools: {
      title: '工具集合',
      subtitle: '发现并使用各种实用工具',
      search: {
        placeholder: '搜索工具...',
        filter: '筛选',
        clearFilter: '清除筛选',
        found: '找到',
        toolsCount: '个工具',
        clearAllFilters: '清除所有筛选',
      },
      categories: {
        all: '全部',
        ai: 'AI工具',
        text: '文本工具',
        image: '图片工具',
        dev: '开发工具',
        utility: '实用工具',
        learn: '学习工具',
        health: '健康工具',
        media: '媒体工具',
        office: '办公工具',
        security: '安全工具',
      },
      popular: '热门',
      noResults: {
        title: '未找到相关工具',
        description: '尝试使用不同的关键词或选择其他分类',
      },
    },
    toolNames: {
      // AI工具
      'ai-text-generator': '文本生成器',
      'ai-language-detect': '语言检测',
      'ai-keyword-extract': '关键词提取',
      'ai-text-summary': '智能摘要',
      'ai-sentiment-analysis': '情感分析',
      // 文本工具
      'text-case': '文本格式转换',
      'text-encode': '编码解码工具',
      'text-regex': '正则表达式测试',
      'text-analyze': '文本分析工具',
      'text-compare': '文本比较工具',
      'text-deduplicate': '文本去重工具',
      'text-stats': '文本统计工具',
      // 图片工具
      'image-compress': '图片压缩工具',
      'image-convert': '图片格式转换',
      'image-watermark': '水印添加工具',
      'image-resize': '图片尺寸调整',
      'image-filter': '图片滤镜工具',
      // 开发工具
      'dev-format': '代码格式化',
      'dev-json': 'JSON工具',
      'dev-color': '颜色选择器',
      'dev-api': 'API测试工具',
      'dev-timestamp': '时间戳转换',
      // 实用工具
      'utility-qr': '二维码生成器',
      'utility-password': '密码生成器',
      'utility-calculator': '计算器',
      'utility-color-picker': '颜色选择器',
      'utility-converter': '单位转换器',
      'utility-data-generator': '数据生成器',
      'utility-file-converter': '文件转换器',
      'utility-network-tools': '网络工具',
      'utility-random': '随机数生成器',
      'utility-time-calculator': '时间计算器',
      'utility-unit-converter': '单位转换器',
      // 学习工具
      'learn-calculator': '数学公式计算器',
      'learn-cheatsheet': '速查表工具',
      'learn-notes': '笔记工具',
      'learn-progress': '学习进度跟踪',
      // 健康工具
      'health-bmi': 'BMI计算器',
      'health-calorie': '卡路里计算器',
      'utility-browser-info': '浏览器信息',
      'utility-pomodoro-timer': '番茄钟计时器',
      'utility-speed-test': '网速测试',
      'utility-gps-coordinates': 'GPS坐标工具',
      'utility-compound-calculator': '复利计算器',
      // 文本工具 - 新增
      'text-character-counter': '字符计数器',
      'text-markdown-editor': 'Markdown编辑器',
      // 开发工具 - 新增
      'dev-gradient-generator': '渐变生成器',
      'dev-image-to-base64': '图片转Base64',
      // 媒体、办公、安全工具
      'media-player': '媒体播放器',
      'office-document-processor': '文档处理器',
      'security-tools': '安全工具集',
      'security-password-strength': '密码强度检测',
    },
    toolDescriptions: {
      // AI工具
      'ai-text-generator': '生成Lorem ipsum、假数据、随机文本等，支持多种生成类型。',
      'ai-language-detect': '自动识别文本的语言类型，支持中英日韩法德西俄阿等多种语言。',
      'ai-keyword-extract': '从文本中智能提取关键词和短语，提供频率统计和重要性评分。',
      'ai-text-summary': '提取文本关键信息，生成简洁摘要（即将推出）。',
      'ai-sentiment-analysis': '分析文本的情感倾向和语调（即将推出）。',
      // 文本工具
      'text-case': '快速转换文本大小写、驼峰命名等格式，支持9种常用格式。',
      'text-encode': 'Base64、URL、HTML等编码解码工具，支持多种格式转换。',
      'text-regex': '在线测试和调试正则表达式，实时查看匹配结果。',
      'text-analyze': '分析文本的字符数、词数、行数等统计信息。',
      'text-compare': '比较两段文本的差异，支持忽略大小写和空白字符。',
      'text-deduplicate': '去除重复的文本行，支持多种去重模式。',
      'text-stats': '统计文本的字符、单词、行数等详细信息。',
      // 图片工具
      'image-compress': '在线压缩图片，优化图片大小，支持质量调节。',
              'image-convert': '基于Canvas API的真实图片格式转换，支持JPEG、PNG、WebP等。',
      'image-watermark': '为图片添加文字水印，支持自定义位置、颜色、透明度等。',
      'image-resize': '调整图片尺寸，支持保持比例、批量处理等功能。',
      'image-filter': '为图片添加各种滤镜效果，支持亮度、对比度、饱和度调节。',
      // 开发工具
      'dev-format': '格式化JavaScript、JSON、CSS等代码，使其更易读。',
      'dev-json': '格式化、验证、压缩JSON数据，支持自定义缩进。',
      'dev-color': '选择颜色并获取多种格式的颜色值，支持RGB、HSL、HEX等格式。',
      'dev-api': '测试API接口，发送HTTP请求并查看响应结果。',
      'dev-timestamp': '时间戳与日期时间相互转换，支持多种格式。',
      // 实用工具
      'utility-qr': '生成自定义二维码，支持文本和URL，可下载使用。',
      'utility-password': '生成安全、随机的密码，支持自定义长度和字符类型。',
      'utility-calculator': '基础计算器，支持加减乘除等基本运算。',
      'utility-color-picker': '选择颜色并获取多种格式的颜色值。',
      'utility-converter': '转换长度、重量、温度等各种单位。',
      'utility-data-generator': '生成测试数据，支持多种格式和类型。',
      'utility-file-converter': '转换各种文件格式，支持文档、图片等。',
      'utility-network-tools': 'IP查询、端口扫描等网络相关工具。',
      'utility-random': '生成随机数、随机字符串等。',
      'utility-time-calculator': '计算时间差、日期加减等时间相关计算。',
      'utility-unit-converter': '转换各种物理单位，支持长度、重量、温度等。',
      // 学习工具
      'learn-calculator': '支持复杂数学计算、科学计算、三角函数等。',
      'learn-cheatsheet': '提供CSS、正则表达式、常用命令等速查功能。',
      'learn-notes': '在线笔记工具，支持Markdown格式。',
      'learn-progress': '跟踪学习进度，设置目标和里程碑。',
      // 健康工具
      'health-bmi': '计算身体质量指数，评估健康状态。',
      'health-calorie': '计算每日所需卡路里，制定饮食计划。',
      'utility-browser-info': '查看浏览器详细信息、屏幕分辨率、用户代理等。',
      'utility-pomodoro-timer': '专注工作计时器，帮助提高工作效率和专注度。',
      'utility-speed-test': '测试网络连接速度，检测延迟和带宽。',
      'utility-gps-coordinates': '获取地理位置坐标，坐标格式转换。',
      'utility-compound-calculator': '计算投资复利收益，制定理财计划。',
      // 文本工具 - 新增
      'text-character-counter': '实时统计文本字符数、词数、行数，支持多种统计模式。',
      'text-markdown-editor': '在线Markdown编辑器，支持实时预览和语法高亮。',
      // 开发工具 - 新增
      'dev-gradient-generator': '生成CSS渐变代码，支持线性和径向渐变，可视化编辑。',
      'dev-image-to-base64': '将图片转换为Base64编码，方便在代码中使用。',
      // 媒体、办公、安全工具
      'media-player': '支持音频和视频播放，包含格式转换、剪辑等功能。',
      'office-document-processor': '文本处理、表格生成、CSV/JSON转换等办公相关工具。',
      'security-tools': '哈希计算、加密解密、密码强度检测、SSL证书检查等安全工具。',
      'security-password-strength': '检测密码安全强度，提供改进建议，确保密码安全。',
    },
    common: {
      loading: '加载中...',
      error: '出错了',
      success: '成功',
      encode: '编码',
      decode: '解码',
      copy: '复制',
      clear: '清空',
    },
    theme: {
      light: '浅色',
      dark: '深色',
      system: '系统',
    },
    toolDetails: {
      // 文本工具
      textCase: {
        title: '文本格式转换',
        description: '快速转换文本大小写、驼峰命名等格式，支持9种常用格式。',
        features: [
          '支持9种常用文本格式转换',
          '实时预览转换结果',
          '支持批量处理',
          '保持原始格式选项'
        ]
      },
      textEncode: {
        title: '编码解码工具',
        description: 'Base64、URL、HTML等编码解码工具，支持多种格式转换。',
        features: [
          '支持Base64编码解码',
          'URL编码解码',
          'HTML实体编码',
          '多种编码格式支持'
        ]
      },
      textRegex: {
        title: '正则表达式测试',
        description: '在线测试和调试正则表达式，实时查看匹配结果。',
        features: [
          '实时正则表达式测试',
          '匹配结果高亮显示',
          '常用正则表达式模板',
          '支持多种正则语法'
        ]
      },
      // 图片工具
      imageCompress: {
        title: '图片压缩工具',
        description: '在线压缩图片，优化图片大小，支持质量调节。',
        features: [
          '智能图片压缩算法',
          '支持多种图片格式',
          '可调节压缩质量',
          '保持图片清晰度'
        ]
      },
      imageConvert: {
        title: '图片格式转换',
        description: '基于浏览器Canvas API的真实格式转换，支持JPEG、PNG、WebP等常用格式。',
        features: [
          '真实的浏览器原生转换',
          '支持质量调节(JPEG/WebP)',
          '本地处理保护隐私',
          '无损/有损格式互转'
        ]
      },
      imageWatermark: {
        title: '水印添加工具',
        description: '为图片添加文字水印，支持自定义位置、颜色、透明度等。',
        features: [
          '自定义水印文字',
          '多种位置选择',
          '颜色和透明度调节',
          '批量添加水印'
        ]
      },
      // 实用工具
      qrGenerator: {
        title: '二维码生成器',
        description: '生成各种类型的二维码，支持文本、链接、WiFi等。',
        features: [
          '支持多种二维码类型',
          '自定义二维码样式',
          '批量生成功能',
          '高清二维码输出'
        ]
      },
      passwordGenerator: {
        title: '密码生成器',
        description: '生成安全可靠的密码，支持自定义长度和字符类型。',
        features: [
          '生成高强度密码',
          '自定义密码长度',
          '多种字符类型选择',
          '密码强度检测'
        ]
      },
      calculator: {
        title: '计算器',
        description: '功能强大的在线计算器，支持科学计算和单位转换。',
        features: [
          '基础数学运算',
          '科学计算功能',
          '单位转换工具',
          '历史记录功能'
        ],
        display: '显示',
        clear: '清除',
        operations: {
          add: '加',
          subtract: '减',
          multiply: '乘',
          divide: '除',
          percentage: '百分比',
          plusMinus: '正负',
        },
        instructions: {
          step1: '输入第一个数字',
          step2: '选择操作符',
          step3: '输入第二个数字',
          step4: '点击等于按钮获取结果',
        },
      },
      randomGenerator: {
        title: '随机数生成器',
        description: '生成随机数字、字符串等，支持自定义范围和格式。',
        features: [
          '生成随机数字',
          '自定义数值范围',
          '随机字符串生成',
          '多种随机类型'
        ]
      }
    },
    ui: {
      buttons: {
        copy: '复制',
        clear: '清除',
        generate: '生成',
        download: '下载',
        regenerate: '重新生成',
        save: '保存',
        cancel: '取消',
        confirm: '确认',
        reset: '重置',
        apply: '应用',
        submit: '提交',
        close: '关闭',
      },
      labels: {
        input: '输入',
        output: '输出',
        result: '结果',
        settings: '设置',
        options: '选项',
        configuration: '配置',
        parameters: '参数',
        format: '格式',
        size: '大小',
        quality: '质量',
        length: '长度',
        type: '类型',
        category: '分类',
        status: '状态',
        progress: '进度',
      },
      placeholders: {
        enterText: '请输入文本',
        enterUrl: '请输入URL',
        enterNumber: '请输入数字',
        selectOption: '请选择选项',
        chooseFile: '请选择文件',
        inputData: '请输入数据',
        searchTools: '搜索工具...',
        enterContent: '请输入内容',
      },
      messages: {
        loading: '加载中...',
        processing: '处理中...',
        success: '成功',
        error: '出错了',
        warning: '警告',
        info: '信息',
        copied: '已复制',
        saved: '已保存',
        generated: '已生成',
        converted: '已转换',
        uploaded: '已上传',
        downloaded: '已下载',
      },
      status: {
        ready: '就绪',
        processing: '处理中',
        completed: '已完成',
        failed: '失败',
        pending: '待处理',
        active: '激活',
        inactive: '未激活',
        enabled: '启用',
        disabled: '禁用',
      },
      strength: {
        veryWeak: '极弱',
        weak: '弱',
        medium: '中等',
        strong: '强',
        veryStrong: '很强',
        extremelyStrong: '极强',
        none: '无',
      },
    },
    toolPages: {
      textCase: {
        inputText: '请输入要转换的文本',
        outputText: '转换后的文本',
        conversionOptions: '转换选项',
        instructions: '转换说明',
        caseTypes: {
          uppercase: { name: '大写', description: '将所有字母转换为大写' },
          lowercase: { name: '小写', description: '将所有字母转换为小写' },
          capitalize: { name: '首字母大写', description: '将每个单词的首字母转换为大写' },
          titlecase: { name: '标题大小写', description: '将每个单词的首字母转换为大写，其余为小写' },
          alternating: { name: '交错大小写', description: '交替转换大小写' },
          inverse: { name: '反转大小写', description: '反转文本的大小写' },
        },
        instructionSteps: {
          step1: '选择要转换的文本格式',
          step2: '选择转换目标格式',
          step3: '点击生成按钮',
          step4: '查看转换结果',
          step5: '复制或下载结果',
        },
      },
      qrGenerator: {
        inputContent: '请输入要生成二维码的内容',
        qrCodeSize: '二维码尺寸',
        errorCorrectionLevel: '纠错级别',
        quickInput: '快速输入',
        generatedQrCode: '生成的二维码',
        errorLevels: {
          low: { label: '低', description: '可以扫描，但可能无法识别' },
          medium: { label: '中', description: '可以扫描，但可能无法识别' },
          high: { label: '高', description: '可以扫描，但可能无法识别' },
          highest: { label: '最高', description: '可以扫描，但可能无法识别' },
        },
        sampleTexts: {
          url: 'https://example.com',
          text: 'Hello World',
          email: 'test@example.com',
          phone: '123-456-7890',
          wifi: 'WIFI:S:MyNetwork;T:WPA;P:mypassword;H:false;',
        },
        instructionSteps: {
          step1: '选择要生成二维码的类型',
          step2: '输入内容或选择快速输入',
          step3: '调整尺寸和纠错级别',
          step4: '点击生成按钮',
          step5: '查看生成的二维码',
        },
      },
      passwordGenerator: {
        generationSettings: '密码生成设置',
        passwordLength: '密码长度',
        characterTypes: '字符类型',
        generatedPassword: '生成的密码',
        passwordStrength: '密码强度',
        securityTips: '安全提示',
        characterOptions: {
          uppercase: '包含大写字母',
          lowercase: '包含小写字母',
          numbers: '包含数字',
          symbols: '包含符号',
          excludeSimilar: '排除相似字符',
        },
        securityTipsList: {
          tip1: '使用至少8个字符',
          tip2: '包含大小写字母',
          tip3: '包含数字和符号',
          tip4: '避免使用常见密码',
          tip5: '定期更换密码',
        },
      },
      calculator: {
        title: '计算器',
        description: '功能强大的在线计算器，支持科学计算和单位转换。',
        display: '显示',
        clear: '清除',
        operations: {
          add: '加',
          subtract: '减',
          multiply: '乘',
          divide: '除',
          percentage: '百分比',
          plusMinus: '正负',
        },
        instructions: {
          step1: '输入第一个数字',
          step2: '选择操作符',
          step3: '输入第二个数字',
          step4: '点击等于按钮获取结果',
        },
      },
      mediaTools: {
        title: '媒体工具',
        description: '音频和视频处理工具集合。',
        tabs: {
          audio: '音频',
          video: '视频',
          converter: '转换器',
        },
        audioFormats: {
          mp3: { name: 'MP3', description: '音频文件格式' },
          wav: { name: 'WAV', description: '音频文件格式' },
          aac: { name: 'AAC', description: '音频文件格式' },
          ogg: { name: 'OGG', description: '音频文件格式' },
          flac: { name: 'FLAC', description: '音频文件格式' },
        },
        videoFormats: {
          mp4: { name: 'MP4', description: '视频文件格式' },
          avi: { name: 'AVI', description: '视频文件格式' },
          mov: { name: 'MOV', description: '视频文件格式' },
          webm: { name: 'WEBM', description: '视频文件格式' },
          mkv: { name: 'MKV', description: '视频文件格式' },
        },
        controls: {
          play: '播放',
          pause: '暂停',
          volume: '音量',
          mute: '静音',
          download: '下载',
          upload: '上传',
        },
        instructions: {
          step1: '选择要处理的媒体文件',
          step2: '选择音频或视频选项',
          step3: '选择输出格式',
          step4: '点击转换按钮',
        },
      },
      officeTools: {
        title: '办公工具',
        description: '文档处理、表格工具等办公相关工具。',
        documentProcessing: '文档处理',
        csvJsonConverter: 'CSV/JSON转换器',
        tableGenerator: '表格生成器',
        batchTextProcessing: '批量文本处理',
        features: {
          caseConversion: '大小写转换',
          formatCleaning: '格式清理',
          csvToJson: 'CSV转JSON',
          jsonToCsv: 'JSON转CSV',
          tableCreation: '表格创建',
          batchProcessing: '批量处理',
        },
        instructions: {
          step1: '选择要处理的文档类型',
          step2: '选择转换选项',
          step3: '点击转换按钮',
          step4: '查看转换结果',
        },
      },
      securityTools: {
        title: '安全工具',
        description: '密码强度检测、加密解密等安全工具。',
        hashTools: '哈希工具',
        encryptionTools: '加密工具',
        passwordStrength: '密码强度',
        sslChecker: 'SSL检查器',
        features: {
          md5: 'MD5哈希',
          sha1: 'SHA-1哈希',
          sha256: 'SHA-256哈希',
          caesarCipher: '凯撒密码',
          base64: 'Base64编码',
          sslValidation: 'SSL验证',
        },
        instructions: {
          step1: '选择要加密的文本',
          step2: '选择加密算法',
          step3: '输入密钥',
          step4: '点击加密按钮',
        },
      },
      bmiCalculator: {
        title: 'BMI计算器',
        description: '计算身体质量指数，评估健康状态。',
        height: '身高 (cm)',
        weight: '体重 (kg)',
        calculate: '计算BMI',
        result: 'BMI结果',
        bmiCategories: {
          underweight: { range: '低于18.5', status: '偏瘦', description: '体重过轻' },
          normal: { range: '18.5-24.9', status: '正常', description: '体重正常' },
          overweight: { range: '25-29.9', status: '超重', description: '体重过重' },
          obese: { range: '30及以上', status: '肥胖', description: '肥胖' },
        },
        instructions: {
          step1: '输入您的身高',
          step2: '输入您的体重',
          step3: '点击计算按钮',
          step4: '查看BMI结果',
        },
      },
      calorieCalculator: {
        title: '卡路里计算器',
        description: '计算每日所需卡路里，制定饮食计划。',
        personalInfo: '个人信息',
        activityLevel: '活动水平',
        goal: '目标',
        calculate: '计算卡路里',
        result: '卡路里结果',
        activityLevels: {
          sedentary: { name: '久坐', description: '很少或没有运动' },
          lightlyActive: { name: '轻度活跃', description: '每周进行1-3次轻度运动' },
          moderatelyActive: { name: '中度活跃', description: '每周进行3-5次中度运动' },
          veryActive: { name: '活跃', description: '每周进行6-7次剧烈运动' },
          extremelyActive: { name: '非常活跃', description: '每周进行2次以上剧烈运动' },
        },
        goals: {
          lose: '减重',
          maintain: '维持体重',
          gain: '增重',
        },
        instructions: {
          step1: '输入您的个人信息',
          step2: '选择您的活动水平',
          step3: '选择您的目标',
          step4: '点击计算按钮',
        },
      },
    },
  },
  'en-US': {
    metadata: {
      title: 'Tool Collection - Efficient & Practical Online Tools',
      description: 'Online tool website providing text processing, image editing, development tools and other practical functions. Fast, secure, and free to use.',
      keywords: 'online tools,text processing,image editing,development tools,utility tools',
      siteName: 'Tool Collection',
    },
    nav: {
      home: 'Home',
      tools: 'Tools',
    },
    home: {
      hero: {
        title: 'Efficient & Practical Online Tools',
        subtitle: 'Providing text processing, image editing, development tools and other practical functions to make your work simpler and more efficient. No registration required, free to use, privacy protected.',
        cta: {
          start: 'Get Started',
          learnMore: 'Learn More',
        },
      },
      features: {
        title: 'Core Features',
        items: {
          fast: {
            title: 'Fast & Efficient',
            description: 'All tools run in the browser, no file upload required, protecting your privacy.',
          },
          secure: {
            title: 'Secure & Reliable',
            description: 'Client-side processing, data is not uploaded to servers, ensuring your information security.',
          },
          free: {
            title: 'Free to Use',
            description: 'All tools are completely free, no registration required, no ads, focusing on user experience.',
          },
        },
      },
    },
    tools: {
      title: 'Tool Collection',
      subtitle: 'Discover and use various practical tools',
      search: {
        placeholder: 'Search tools...',
        filter: 'Filter',
        clearFilter: 'Clear Filter',
        found: 'Found',
        toolsCount: 'tools',
        clearAllFilters: 'Clear All Filters',
      },
      categories: {
        all: 'All',
        ai: 'AI Tools',
        text: 'Text Tools',
        image: 'Image Tools',
        dev: 'Development Tools',
        utility: 'Utility Tools',
        learn: 'Learning Tools',
        health: 'Health Tools',
        media: 'Media Tools',
        office: 'Office Tools',
        security: 'Security Tools',
      },
      popular: 'Popular',
      noResults: {
        title: 'No tools found',
        description: 'Try using different keywords or select other categories',
      },
    },
    toolNames: {
      // AI工具
      'ai-text-generator': 'Text Generator',
      'ai-language-detect': 'Language Detection',
      'ai-keyword-extract': 'Keyword Extraction',
      'ai-text-summary': 'Smart Summary',
      'ai-sentiment-analysis': 'Sentiment Analysis',
      // 文本工具
      'text-case': 'Text Format Converter',
      'text-encode': 'Encode/Decode Tool',
      'text-regex': 'Regular Expression Tester',
      'text-analyze': 'Text Analysis Tool',
      'text-compare': 'Text Comparison Tool',
      'text-deduplicate': 'Text Deduplication Tool',
      'text-stats': 'Text Statistics Tool',
      // 图片工具
      'image-compress': 'Image Compression Tool',
      'image-convert': 'Image Format Converter',
      'image-watermark': 'Watermark Adding Tool',
      'image-resize': 'Image Resize Tool',
      'image-filter': 'Image Filter Tool',
      // 开发工具
      'dev-format': 'Code Formatter',
      'dev-json': 'JSON Tool',
      'dev-color': 'Color Picker',
      'dev-api': 'API Testing Tool',
      'dev-timestamp': 'Timestamp Converter',
      // 实用工具
      'utility-qr': 'QR Code Generator',
      'utility-password': 'Password Generator',
      'utility-calculator': 'Calculator',
      'utility-color-picker': 'Color Picker',
      'utility-converter': 'Unit Converter',
      'utility-data-generator': 'Data Generator',
      'utility-file-converter': 'File Converter',
      'utility-network-tools': 'Network Tools',
      'utility-random': 'Random Number Generator',
      'utility-time-calculator': 'Time Calculator',
      'utility-unit-converter': 'Unit Converter',
      // 学习工具
      'learn-calculator': 'Math Formula Calculator',
      'learn-cheatsheet': 'Cheatsheet Tool',
      'learn-notes': 'Notes Tool',
      'learn-progress': 'Learning Progress Tracker',
      // 健康工具
      'health-bmi': 'BMI Calculator',
      'health-calorie': 'Calorie Calculator',
      'utility-browser-info': 'Browser Information',
      'utility-pomodoro-timer': 'Pomodoro Timer',
      'utility-speed-test': 'Internet Speed Test',
      'utility-gps-coordinates': 'GPS Coordinates Tool',
      'utility-compound-calculator': 'Compound Interest Calculator',
      // 文本工具 - 新增
      'text-character-counter': 'Character Counter',
      'text-markdown-editor': 'Markdown Editor',
      // 开发工具 - 新增
      'dev-gradient-generator': 'Gradient Generator',
      'dev-image-to-base64': 'Image to Base64',
      // 媒体、办公、安全工具
      'media-player': 'Media Player',
      'office-document-processor': 'Document Processor',
      'security-tools': 'Security Tools Suite',
      'security-password-strength': 'Password Strength Checker',
    },
    toolDescriptions: {
      // AI工具
      'ai-text-generator': 'Generate Lorem ipsum, fake data, random text, etc., supporting multiple generation types.',
      'ai-language-detect': 'Automatically identify text language types, supporting Chinese, English, Japanese, Korean, French, German, Spanish, Russian, Arabic and other languages.',
      'ai-keyword-extract': 'Intelligently extract keywords and phrases from text, providing frequency statistics and importance scores.',
      'ai-text-summary': 'Extract key information from text and generate concise summaries (coming soon).',
      'ai-sentiment-analysis': 'Analyze the emotional tendency and tone of text (coming soon).',
      // 文本工具
      'text-case': 'Quickly convert text case, camelCase naming and other formats, supporting 9 common formats.',
      'text-encode': 'Base64, URL, HTML encoding and decoding tools, supporting multiple format conversions.',
      'text-regex': 'Online testing and debugging of regular expressions with real-time match results.',
      'text-analyze': 'Analyze text character count, word count, line count and other statistics.',
      'text-compare': 'Compare differences between two texts, supporting case-insensitive and whitespace ignoring.',
      'text-deduplicate': 'Remove duplicate text lines, supporting multiple deduplication modes.',
      'text-stats': 'Statistics on text characters, words, lines and other detailed information.',
      // 图片工具
      'image-compress': 'Online image compression, optimize image size with quality adjustment support.',
      'image-convert': 'Convert images to different formats, supporting JPEG, PNG, WebP, etc.',
      'image-watermark': 'Add text watermarks to images with customizable position, color, transparency, etc.',
      'image-resize': 'Adjust image dimensions, supporting aspect ratio preservation and batch processing.',
      'image-filter': 'Add various filter effects to images, supporting brightness, contrast, saturation adjustment.',
      // 开发工具
      'dev-format': 'Format JavaScript, JSON, CSS and other code to make it more readable.',
      'dev-json': 'Format, validate, compress JSON data with custom indentation support.',
      'dev-color': 'Select colors and get color values in multiple formats, supporting RGB, HSL, HEX, etc.',
      'dev-api': 'Test API interfaces, send HTTP requests and view response results.',
      'dev-timestamp': 'Convert between timestamps and date/time, supporting multiple formats.',
      // 实用工具
      'utility-qr': 'Generate custom QR codes, supporting text and URLs, downloadable for use.',
      'utility-password': 'Generate secure, random passwords with customizable length and character types.',
      'utility-calculator': 'Basic calculator supporting addition, subtraction, multiplication, division and other basic operations.',
      'utility-color-picker': 'Select colors and get color values in multiple formats.',
      'utility-converter': 'Convert various units such as length, weight, temperature, etc.',
      'utility-data-generator': 'Generate test data, supporting multiple formats and types.',
      'utility-file-converter': 'Convert various file formats, supporting documents, images, etc.',
      'utility-network-tools': 'IP query, port scanning and other network-related tools.',
      'utility-random': 'Generate random numbers, random strings, etc.',
      'utility-time-calculator': 'Calculate time differences, date addition/subtraction and other time-related calculations.',
      'utility-unit-converter': 'Convert various physical units, supporting length, weight, temperature, etc.',
      // 学习工具
      'learn-calculator': 'Support complex mathematical calculations, scientific calculations, trigonometric functions, etc.',
      'learn-cheatsheet': 'Provide CSS, regular expressions, common commands and other quick reference functions.',
      'learn-notes': 'Online note-taking tool with Markdown format support.',
      'learn-progress': 'Track learning progress, set goals and milestones.',
      // 健康工具
      'health-bmi': 'Calculate body mass index and assess health status.',
      'health-calorie': 'Calculate daily calorie requirements and develop dietary plans.',
      'utility-browser-info': 'View detailed browser information, screen resolution, user agent, etc.',
      'utility-pomodoro-timer': 'Focus work timer to help improve work efficiency and concentration.',
      'utility-speed-test': 'Test internet connection speed, check latency and bandwidth.',
      'utility-gps-coordinates': 'Get geographic location coordinates and coordinate format conversion.',
      'utility-compound-calculator': 'Calculate investment compound returns and develop financial plans.',
      // 文本工具 - 新增
      'text-character-counter': 'Real-time statistics of text characters, words, lines, supporting multiple counting modes.',
      'text-markdown-editor': 'Online Markdown editor with real-time preview and syntax highlighting.',
      // 开发工具 - 新增
      'dev-gradient-generator': 'Generate CSS gradient code, supporting linear and radial gradients with visual editing.',
      'dev-image-to-base64': 'Convert images to Base64 encoding for convenient use in code.',
      // 媒体、办公、安全工具
      'media-player': 'Support audio and video playback, including format conversion, editing and other functions.',
      'office-document-processor': 'Text processing, table generation, CSV/JSON conversion and other office-related tools.',
      'security-tools': 'Hash calculation, encryption/decryption, password strength detection, SSL certificate checking and other security tools.',
      'security-password-strength': 'Check password security strength, provide improvement suggestions to ensure password security.',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      encode: 'Encode',
      decode: 'Decode',
      copy: 'Copy',
      clear: 'Clear',
    },
    theme: {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    toolDetails: {
      // 文本工具
      textCase: {
        title: 'Text Format Converter',
        description: 'Quickly convert text case, camelCase naming and other formats, supporting 9 common formats.',
        features: [
          'Support 9 common text format conversions',
          'Real-time preview of conversion results',
          'Batch processing support',
          'Original format preservation options'
        ]
      },
      textEncode: {
        title: 'Encode/Decode Tool',
        description: 'Base64, URL, HTML encoding and decoding tools, supporting multiple format conversions.',
        features: [
          'Base64 encoding and decoding',
          'URL encoding and decoding',
          'HTML entity encoding',
          'Multiple encoding format support'
        ]
      },
      textRegex: {
        title: 'Regular Expression Tester',
        description: 'Online testing and debugging of regular expressions with real-time match results.',
        features: [
          'Real-time regular expression testing',
          'Match result highlighting',
          'Common regex templates',
          'Support for multiple regex syntax'
        ]
      },
      // 图片工具
      imageCompress: {
        title: 'Image Compression Tool',
        description: 'Online image compression, optimize image size with quality adjustment support.',
        features: [
          'Intelligent image compression algorithm',
          'Support for multiple image formats',
          'Adjustable compression quality',
          'Maintain image clarity'
        ]
      },
      imageConvert: {
        title: 'Image Format Converter',
        description: 'Convert images to different formats, supporting JPEG, PNG, WebP, etc.',
        features: [
          'Support for multiple image format conversion',
          'Batch conversion functionality',
          'Maintain image quality',
          'Fast conversion processing'
        ]
      },
      imageWatermark: {
        title: 'Watermark Adding Tool',
        description: 'Add text watermarks to images with customizable position, color, transparency, etc.',
        features: [
          'Custom watermark text',
          'Multiple position options',
          'Color and transparency adjustment',
          'Batch watermark adding'
        ]
      },
      // 实用工具
      qrGenerator: {
        title: 'QR Code Generator',
        description: 'Generate various types of QR codes, supporting text, links, WiFi, etc.',
        features: [
          'Support for multiple QR code types',
          'Custom QR code styling',
          'Batch generation functionality',
          'High-quality QR code output'
        ]
      },
      passwordGenerator: {
        title: 'Password Generator',
        description: 'Generate secure and reliable passwords with customizable length and character types.',
        features: [
          'Generate high-strength passwords',
          'Customizable password length',
          'Multiple character type options',
          'Password strength detection'
        ]
      },
      calculator: {
        title: 'Calculator',
        description: 'Powerful online calculator with scientific calculation and unit conversion support.',
        features: [
          'Basic mathematical operations',
          'Scientific calculation functions',
          'Unit conversion tools',
          'History record function'
        ],
        display: 'Display',
        clear: 'Clear',
        operations: {
          add: 'Add',
          subtract: 'Subtract',
          multiply: 'Multiply',
          divide: 'Divide',
          percentage: 'Percentage',
          plusMinus: 'Plus/Minus',
        },
        instructions: {
          step1: 'Enter the first number',
          step2: 'Select the operator',
          step3: 'Enter the second number',
          step4: 'Click the equals button to get the result',
        },
      },
      randomGenerator: {
        title: 'Random Number Generator',
        description: 'Generate random numbers, strings, etc., with customizable ranges and formats.',
        features: [
          'Generate random numbers',
          'Customizable value ranges',
          'Random string generation',
          'Multiple random types'
        ]
      }
    },
    ui: {
      buttons: {
        copy: 'Copy',
        clear: 'Clear',
        generate: 'Generate',
        download: 'Download',
        regenerate: 'Regenerate',
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        reset: 'Reset',
        apply: 'Apply',
        submit: 'Submit',
        close: 'Close',
      },
      labels: {
        input: 'Input',
        output: 'Output',
        result: 'Result',
        settings: 'Settings',
        options: 'Options',
        configuration: 'Configuration',
        parameters: 'Parameters',
        format: 'Format',
        size: 'Size',
        quality: 'Quality',
        length: 'Length',
        type: 'Type',
        category: 'Category',
        status: 'Status',
        progress: 'Progress',
      },
      placeholders: {
        enterText: 'Enter text',
        enterUrl: 'Enter URL',
        enterNumber: 'Enter number',
        selectOption: 'Select option',
        chooseFile: 'Choose file',
        inputData: 'Enter data',
        searchTools: 'Search tools...',
        enterContent: 'Enter content',
      },
      messages: {
        loading: 'Loading...',
        processing: 'Processing...',
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info',
        copied: 'Copied',
        saved: 'Saved',
        generated: 'Generated',
        converted: 'Converted',
        uploaded: 'Uploaded',
        downloaded: 'Downloaded',
      },
      status: {
        ready: 'Ready',
        processing: 'Processing',
        completed: 'Completed',
        failed: 'Failed',
        pending: 'Pending',
        active: 'Active',
        inactive: 'Inactive',
        enabled: 'Enabled',
        disabled: 'Disabled',
      },
      strength: {
        veryWeak: 'Very Weak',
        weak: 'Weak',
        medium: 'Medium',
        strong: 'Strong',
        veryStrong: 'Very Strong',
        extremelyStrong: 'Extremely Strong',
        none: 'None',
      },
    },
    toolPages: {
      textCase: {
        inputText: 'Enter text to convert',
        outputText: 'Converted text',
        conversionOptions: 'Conversion Options',
        instructions: 'Conversion Instructions',
        caseTypes: {
          uppercase: { name: 'Uppercase', description: 'Convert all letters to uppercase' },
          lowercase: { name: 'Lowercase', description: 'Convert all letters to lowercase' },
          capitalize: { name: 'Capitalize', description: 'Convert the first letter of each word to uppercase, the rest to lowercase' },
          titlecase: { name: 'Title Case', description: 'Convert the first letter of each word to uppercase, the rest to lowercase' },
          alternating: { name: 'Alternating Case', description: 'Alternate case conversion' },
          inverse: { name: 'Inverse Case', description: 'Reverse text case' },
        },
        instructionSteps: {
          step1: 'Select the text format to convert',
          step2: 'Select the target format for conversion',
          step3: 'Click the generate button',
          step4: 'View the conversion result',
          step5: 'Copy or download the result',
        },
      },
      qrGenerator: {
        inputContent: 'Enter content for QR code generation',
        qrCodeSize: 'QR Code Size',
        errorCorrectionLevel: 'Error Correction Level',
        quickInput: 'Quick Input',
        generatedQrCode: 'Generated QR Code',
        errorLevels: {
          low: { label: 'Low', description: 'Can be scanned, but may not be recognized' },
          medium: { label: 'Medium', description: 'Can be scanned, but may not be recognized' },
          high: { label: 'High', description: 'Can be scanned, but may not be recognized' },
          highest: { label: 'Highest', description: 'Can be scanned, but may not be recognized' },
        },
        sampleTexts: {
          url: 'https://example.com',
          text: 'Hello World',
          email: 'test@example.com',
          phone: '123-456-7890',
          wifi: 'WIFI:S:MyNetwork;T:WPA;P:mypassword;H:false;',
        },
                 instructionSteps: {
           step1: 'Select the type of QR code to generate',
           step2: 'Enter content or select quick input',
           step3: 'Adjust size and error correction level',
           step4: 'Click the generate button',
           step5: 'View the generated QR code',
         },
      },
      passwordGenerator: {
        generationSettings: 'Password Generation Settings',
        passwordLength: 'Password Length',
        characterTypes: 'Character Types',
        generatedPassword: 'Generated Password',
        passwordStrength: 'Password Strength',
        securityTips: 'Security Tips',
        characterOptions: {
          uppercase: 'Include Uppercase Letters',
          lowercase: 'Include Lowercase Letters',
          numbers: 'Include Numbers',
          symbols: 'Include Symbols',
          excludeSimilar: 'Exclude Similar Characters',
        },
        securityTipsList: {
          tip1: 'Use at least 8 characters',
          tip2: 'Include uppercase and lowercase letters',
          tip3: 'Include numbers and symbols',
          tip4: 'Avoid using common passwords',
          tip5: 'Change passwords regularly',
        },
      },
      calculator: {
        title: 'Calculator',
        description: 'Powerful online calculator with scientific calculation and unit conversion support.',
        display: 'Display',
        clear: 'Clear',
        operations: {
          add: 'Add',
          subtract: 'Subtract',
          multiply: 'Multiply',
          divide: 'Divide',
          percentage: 'Percentage',
          plusMinus: 'Plus/Minus',
        },
        instructions: {
          step1: 'Enter the first number',
          step2: 'Select the operator',
          step3: 'Enter the second number',
          step4: 'Click the equals button to get the result',
        },
      },
      mediaTools: {
        title: 'Media Tools',
        description: 'Audio and video processing tool collection.',
        tabs: {
          audio: 'Audio',
          video: 'Video',
          converter: 'Converter',
        },
        audioFormats: {
          mp3: { name: 'MP3', description: 'Audio file format' },
          wav: { name: 'WAV', description: 'Audio file format' },
          aac: { name: 'AAC', description: 'Audio file format' },
          ogg: { name: 'OGG', description: 'Audio file format' },
          flac: { name: 'FLAC', description: 'Audio file format' },
        },
        videoFormats: {
          mp4: { name: 'MP4', description: 'Video file format' },
          avi: { name: 'AVI', description: 'Video file format' },
          mov: { name: 'MOV', description: 'Video file format' },
          webm: { name: 'WEBM', description: 'Video file format' },
          mkv: { name: 'MKV', description: 'Video file format' },
        },
        controls: {
          play: 'Play',
          pause: 'Pause',
          volume: 'Volume',
          mute: 'Mute',
          download: 'Download',
          upload: 'Upload',
        },
        instructions: {
          step1: 'Select the media file to process',
          step2: 'Select audio or video option',
          step3: 'Select output format',
          step4: 'Click convert button',
        },
      },
      officeTools: {
        title: 'Office Tools',
        description: 'Document processing, spreadsheet tools and other office-related tools.',
        documentProcessing: 'Document Processing',
        csvJsonConverter: 'CSV/JSON Converter',
        tableGenerator: 'Table Generator',
        batchTextProcessing: 'Batch Text Processing',
        features: {
          caseConversion: 'Case Conversion',
          formatCleaning: 'Format Cleaning',
          csvToJson: 'CSV to JSON',
          jsonToCsv: 'JSON to CSV',
          tableCreation: 'Table Creation',
          batchProcessing: 'Batch Processing',
        },
        instructions: {
          step1: 'Select the type of document to process',
          step2: 'Select conversion options',
          step3: 'Click convert button',
          step4: 'View conversion result',
        },
      },
      securityTools: {
        title: 'Security Tools',
        description: 'Password strength detection, encryption/decryption and other security tools.',
        hashTools: 'Hash Tools',
        encryptionTools: 'Encryption Tools',
        passwordStrength: 'Password Strength',
        sslChecker: 'SSL Checker',
        features: {
          md5: 'MD5 Hash',
          sha1: 'SHA-1 Hash',
          sha256: 'SHA-256 Hash',
          caesarCipher: 'Caesar Cipher',
          base64: 'Base64 Encoding',
          sslValidation: 'SSL Validation',
        },
        instructions: {
          step1: 'Enter the text to encrypt',
          step2: 'Select encryption algorithm',
          step3: 'Enter key',
          step4: 'Click encrypt button',
        },
      },
      bmiCalculator: {
        title: 'BMI Calculator',
        description: 'Calculate body mass index and assess health status.',
        height: 'Height (cm)',
        weight: 'Weight (kg)',
        calculate: 'Calculate BMI',
        result: 'BMI Result',
        bmiCategories: {
          underweight: { range: 'Under 18.5', status: 'Underweight', description: 'Underweight' },
          normal: { range: '18.5-24.9', status: 'Normal', description: 'Normal weight' },
          overweight: { range: '25-29.9', status: 'Overweight', description: 'Overweight' },
          obese: { range: '30 or more', status: 'Obese', description: 'Obese' },
        },
        instructions: {
          step1: 'Enter your height',
          step2: 'Enter your weight',
          step3: 'Click calculate button',
          step4: 'View BMI result',
        },
      },
      calorieCalculator: {
        title: 'Calorie Calculator',
        description: 'Calculate daily calorie requirements and develop dietary plans.',
        personalInfo: 'Personal Information',
        activityLevel: 'Activity Level',
        goal: 'Goal',
        calculate: 'Calculate Calories',
        result: 'Calorie Result',
        activityLevels: {
          sedentary: { name: 'Sedentary', description: 'Little or no exercise' },
          lightlyActive: { name: 'Lightly Active', description: 'Exercise 1-3 times per week' },
          moderatelyActive: { name: 'Moderately Active', description: 'Exercise 3-5 times per week' },
          veryActive: { name: 'Very Active', description: 'Exercise 6-7 times per week' },
          extremelyActive: { name: 'Extremely Active', description: 'Exercise 2 or more times per week' },
        },
        goals: {
          lose: 'Lose Weight',
          maintain: 'Maintain Weight',
          gain: 'Gain Weight',
        },
        instructions: {
          step1: 'Enter your personal information',
          step2: 'Select your activity level',
          step3: 'Select your goal',
          step4: 'Click calculate button',
        },
      },
    },
  },
};

export function getTranslation(locale: Locale): Translations {
  return translations[locale] || translations['zh-CN'];
} 