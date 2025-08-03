'use client';

import { useLanguage } from './language-provider';

export function useToolTranslations() {
  const { t } = useLanguage();

  const getToolTranslation = (toolId: string) => {
    const toolTranslations: Record<string, any> = {
      'text-case': t.toolDetails.textCase,
      'text-encode': t.toolDetails.textEncode,
      'text-regex': t.toolDetails.textRegex,
      'image-compress': t.toolDetails.imageCompress,
      'image-convert': t.toolDetails.imageConvert,
      'image-watermark': t.toolDetails.imageWatermark,
      'utility-qr': t.toolDetails.qrGenerator,
      'utility-password': t.toolDetails.passwordGenerator,
      'utility-calculator': t.toolDetails.calculator,
      'utility-random': t.toolDetails.randomGenerator,
    };

    return toolTranslations[toolId] || {
      title: 'Tool',
      description: 'Tool description',
      features: []
    };
  };

  // 获取通用UI翻译
  const getUITranslation = () => {
    return t.ui || {
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
    };
  };

  // 获取工具页面特定翻译
  const getToolPageTranslation = (toolId: string) => {
    const toolPageTranslations: Record<string, any> = {
      'text-case': {
        inputText: '输入文本',
        outputText: '转换结果',
        conversionOptions: '转换选项',
        instructions: '使用说明',
        caseTypes: {
          uppercase: { name: '全部大写', description: '将所有字母转换为大写' },
          lowercase: { name: '全部小写', description: '将所有字母转换为小写' },
          capitalize: { name: '首字母大写', description: '每个单词的首字母大写' },
          titlecase: { name: '标题格式', description: '每个单词首字母大写，其余小写' },
          alternating: { name: '交替大小写', description: '字母交替大小写' },
          inverse: { name: '大小写反转', description: '反转当前的大小写状态' },
        },
        instructionSteps: [
          '在左侧输入框中输入要转换的文本',
          '点击右侧的转换选项进行大小写转换',
          '转换结果会实时显示在右侧区域',
          '可以点击复制按钮复制转换后的文本',
          '支持多种大小写转换格式'
        ],
      },
      'utility-qr': {
        inputContent: '输入内容',
        qrCodeSize: '二维码尺寸',
        errorCorrectionLevel: '纠错级别',
        quickInput: '快速输入',
        generatedQrCode: '生成的二维码',
        errorLevels: {
          low: { label: '低 (7%)', description: '可恢复7%的数据' },
          medium: { label: '中 (15%)', description: '可恢复15%的数据' },
          high: { label: '高 (25%)', description: '可恢复25%的数据' },
          highest: { label: '最高 (30%)', description: '可恢复30%的数据' },
        },
        sampleTexts: {
          url: '网址',
          text: '文本',
          email: '邮箱',
          phone: '电话',
          wifi: 'WiFi',
        },
        instructionSteps: [
          '在输入框中输入要生成二维码的内容',
          '调整二维码尺寸和纠错级别',
          '二维码会自动生成并显示在右侧',
          '可以下载或复制生成的二维码图片',
          '支持文本、网址、邮箱、电话、WiFi等多种格式'
        ],
      },
      'utility-password': {
        generationSettings: '生成设置',
        passwordLength: '密码长度',
        characterTypes: '包含字符类型',
        generatedPassword: '生成的密码',
        passwordStrength: '密码强度',
        securityTips: '安全提示',
        characterOptions: {
          uppercase: '大写字母 (A-Z)',
          lowercase: '小写字母 (a-z)',
          numbers: '数字 (0-9)',
          symbols: '特殊字符 (!@#$%^&*)',
          excludeSimilar: '排除相似字符 (il1Lo0O)',
        },
        securityTipsList: [
          '使用至少12位长度的密码',
          '包含大小写字母、数字和特殊字符',
          '避免使用个人信息作为密码',
          '定期更换密码',
          '不同账户使用不同密码'
        ],
      },
      'utility-calculator': {
        title: '计算器',
        description: '基础计算功能，支持四则运算',
        display: '显示屏',
        clear: '清除',
        operations: {
          add: '加',
          subtract: '减',
          multiply: '乘',
          divide: '除',
          percentage: '百分比',
          plusMinus: '正负',
        },
        instructionSteps: [
          '输入第一个数字',
          '选择操作符',
          '输入第二个数字',
          '点击等于按钮获取结果'
        ],
      },
      'media': {
        title: '媒体工具',
        description: '音频和视频处理工具集合',
        tabs: {
          audio: '音频工具',
          video: '视频工具',
          converter: '格式转换',
        },
        audioFormats: {
          mp3: { name: 'MP3', description: '最常用的音频格式，兼容性好' },
          wav: { name: 'WAV', description: '无损音频格式，文件较大' },
          aac: { name: 'AAC', description: '苹果设备常用格式' },
          ogg: { name: 'OGG', description: '开源音频格式' },
          flac: { name: 'FLAC', description: '无损压缩格式' },
        },
        videoFormats: {
          mp4: { name: 'MP4', description: '最常用的视频格式' },
          avi: { name: 'AVI', description: '传统视频格式' },
          mov: { name: 'MOV', description: '苹果设备常用格式' },
          webm: { name: 'WebM', description: '网页视频格式' },
          mkv: { name: 'MKV', description: '开源容器格式' },
        },
        controls: {
          play: '播放',
          pause: '暂停',
          volume: '音量',
          mute: '静音',
          download: '下载',
          upload: '上传',
        },
        instructionSteps: [
          '选择要处理的媒体文件',
          '选择音频或视频选项',
          '选择输出格式',
          '点击转换按钮'
        ],
      },
      'office': {
        title: '办公工具',
        description: '文档处理、表格工具等办公相关工具',
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
        instructionSteps: [
          '选择要处理的文档类型',
          '选择转换选项',
          '点击转换按钮',
          '查看转换结果'
        ],
      },
      'security': {
        title: '安全工具',
        description: '密码强度检测、加密解密等安全工具',
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
        instructionSteps: [
          '选择要加密的文本',
          '选择加密算法',
          '输入密钥',
          '点击加密按钮'
        ],
      },
      'health-bmi': {
        title: 'BMI计算器',
        description: '计算身体质量指数，评估健康状态',
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
        instructionSteps: [
          '输入您的身高',
          '输入您的体重',
          '点击计算按钮',
          '查看BMI结果'
        ],
      },
      'health-calorie': {
        title: '卡路里计算器',
        description: '计算每日所需卡路里，制定饮食计划',
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
        instructionSteps: [
          '输入您的个人信息',
          '选择您的活动水平',
          '选择您的目标',
          '点击计算按钮'
        ],
      },
    };

    return toolPageTranslations[toolId] || {
      inputText: 'Input Text',
      outputText: 'Output Text',
      conversionOptions: 'Conversion Options',
      instructions: 'Instructions',
    };
  };

  return { 
    getToolTranslation, 
    getUITranslation, 
    getToolPageTranslation 
  };
} 