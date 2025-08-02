'use client';

import { useState } from 'react';
import { BookOpen, Copy, Search, Code, FileText, Command } from 'lucide-react';

interface CheatSheetItem {
  title: string;
  description: string;
  code: string;
  category: string;
  tags: string[];
}

export default function CheatSheetPage() {
  const [selectedCategory, setSelectedCategory] = useState('css');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'css', name: 'CSS', icon: Code },
    { id: 'regex', name: '正则表达式', icon: FileText },
    { id: 'commands', name: '常用命令', icon: Command },
  ];

  const cheatSheets: CheatSheetItem[] = [
    // CSS 速查表
    {
      title: 'Flexbox 布局',
      description: 'Flexbox 常用属性',
      code: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
}`,
      category: 'css',
      tags: ['flexbox', '布局', '居中'],
    },
    {
      title: 'Grid 布局',
      description: 'CSS Grid 常用属性',
      code: `.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
  align-items: center;
}`,
      category: 'css',
      tags: ['grid', '布局', '网格'],
    },
    {
      title: '响应式设计',
      description: '媒体查询断点',
      code: `/* 移动端 */
@media (max-width: 768px) { }

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) { }

/* 桌面端 */
@media (min-width: 1025px) { }`,
      category: 'css',
      tags: ['响应式', '媒体查询', '断点'],
    },
    {
      title: '动画效果',
      description: 'CSS 动画和过渡',
      code: `.animated {
  transition: all 0.3s ease;
  animation: slideIn 0.5s ease-in-out;
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}`,
      category: 'css',
      tags: ['动画', '过渡', 'keyframes'],
    },
    {
      title: '阴影效果',
      description: 'CSS 阴影属性',
      code: `.shadow {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}`,
      category: 'css',
      tags: ['阴影', 'box-shadow', 'text-shadow'],
    },

    // 正则表达式速查表
    {
      title: '邮箱验证',
      description: '验证邮箱格式的正则表达式',
      code: `/^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/`,
      category: 'regex',
      tags: ['邮箱', '验证', '格式'],
    },
    {
      title: '手机号验证',
      description: '验证中国大陆手机号',
      code: `/^1[3-9]\\d{9}$/`,
      category: 'regex',
      tags: ['手机号', '验证', '中国'],
    },
    {
      title: '身份证验证',
      description: '验证中国大陆身份证号',
      code: `/^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$/`,
      category: 'regex',
      tags: ['身份证', '验证', '中国'],
    },
    {
      title: 'URL 验证',
      description: '验证 URL 格式',
      code: `/^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$/`,
      category: 'regex',
      tags: ['URL', '验证', '链接'],
    },
    {
      title: '密码强度验证',
      description: '验证密码强度（至少8位，包含大小写字母和数字）',
      code: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$/`,
      category: 'regex',
      tags: ['密码', '强度', '验证'],
    },

    // 常用命令速查表
    {
      title: 'Git 常用命令',
      description: 'Git 版本控制常用命令',
      code: `# 初始化仓库
git init

# 添加文件到暂存区
git add .

# 提交更改
git commit -m "提交信息"

# 查看状态
git status

# 查看提交历史
git log

# 创建分支
git branch feature-name

# 切换分支
git checkout feature-name

# 合并分支
git merge feature-name`,
      category: 'commands',
      tags: ['git', '版本控制', '分支'],
    },
    {
      title: 'Docker 常用命令',
      description: 'Docker 容器管理命令',
      code: `# 构建镜像
docker build -t image-name .

# 运行容器
docker run -d -p 8080:80 image-name

# 查看运行中的容器
docker ps

# 停止容器
docker stop container-id

# 删除容器
docker rm container-id

# 查看镜像
docker images

# 删除镜像
docker rmi image-name`,
      category: 'commands',
      tags: ['docker', '容器', '镜像'],
    },
    {
      title: 'Linux 常用命令',
      description: 'Linux 系统管理命令',
      code: `# 查看文件
ls -la

# 切换目录
cd /path/to/directory

# 创建目录
mkdir directory-name

# 删除文件
rm filename

# 复制文件
cp source destination

# 移动文件
mv source destination

# 查看文件内容
cat filename

# 查看进程
ps aux`,
      category: 'commands',
      tags: ['linux', '系统', '文件'],
    },
    {
      title: 'NPM 常用命令',
      description: 'Node.js 包管理命令',
      code: `# 初始化项目
npm init

# 安装依赖
npm install package-name

# 全局安装
npm install -g package-name

# 运行脚本
npm run script-name

# 查看已安装的包
npm list

# 更新包
npm update

# 卸载包
npm uninstall package-name`,
      category: 'commands',
      tags: ['npm', 'node.js', '包管理'],
    },
  ];

  const filteredCheatSheets = cheatSheets.filter(item => {
    const matchesCategory = item.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          速查表工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          提供CSS、正则表达式、常用命令等速查功能
        </p>
      </div>

      <div className="space-y-6">
        {/* 分类选择 */}
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* 搜索框 */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="搜索速查表..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* 速查表列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCheatSheets.map((item, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(item.code)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                  title="复制代码"
                >
                  <Copy className="w-3 h-3" />
                  复制
                </button>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <pre className="text-sm font-mono text-gray-900 dark:text-white overflow-x-auto">
                  <code>{item.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>

        {filteredCheatSheets.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>没有找到匹配的速查表</p>
          </div>
        )}
      </div>
    </div>
  );
} 