'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState, useRef } from 'react';
import { 
  Bold, Italic, Link, List, ListOrdered, Quote, Code, Image,
  Eye, EyeOff, Download, Copy, Upload, RotateCcw, Maximize2,
  Type, Hash, Minus
} from 'lucide-react';

export default function MarkdownEditorPage() {
  const [content, setContent] = useState(`# Markdown编辑器

## 功能特性

这是一个功能强大的Markdown编辑器，支持：

- **粗体文本**
- *斜体文本*
- \`内联代码\`
- [链接](https://example.com)

### 代码块

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### 引用

> 这是一个引用块
> 可以包含多行内容

### 列表

1. 有序列表项1
2. 有序列表项2
3. 有序列表项3

- 无序列表项
  - 嵌套列表项
  - 另一个嵌套项

### 表格

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |

---

开始编辑您的Markdown内容！`);
  
  const [showPreview, setShowPreview] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = selectedText || placeholder;
    
    const newText = content.substring(0, start) + before + replacement + after + content.substring(end);
    setContent(newText);
    
    // 设置新的光标位置
    setTimeout(() => {
      if (textarea) {
        const newStart = start + before.length;
        const newEnd = newStart + replacement.length;
        textarea.focus();
        textarea.setSelectionRange(newStart, newEnd);
      }
    }, 0);
  };

  const insertAtLine = (text: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const lines = content.substring(0, start).split('\n');
    const currentLineStart = content.lastIndexOf('\n', start - 1) + 1;
    
    const newContent = content.substring(0, currentLineStart) + text + content.substring(currentLineStart);
    setContent(newContent);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }
    }, 0);
  };

  const formatActions = [
    { icon: Bold, action: () => insertText('**', '**', '粗体文本'), title: '粗体' },
    { icon: Italic, action: () => insertText('*', '*', '斜体文本'), title: '斜体' },
    { icon: Code, action: () => insertText('`', '`', '代码'), title: '内联代码' },
    { icon: Link, action: () => insertText('[', '](url)', '链接文本'), title: '链接' },
    { icon: Image, action: () => insertText('![', '](url)', '图片描述'), title: '图片' },
    { icon: Quote, action: () => insertAtLine('> '), title: '引用' },
    { icon: List, action: () => insertAtLine('- '), title: '无序列表' },
    { icon: ListOrdered, action: () => insertAtLine('1. '), title: '有序列表' },
    { icon: Hash, action: () => insertAtLine('# '), title: '标题' },
    { icon: Minus, action: () => insertAtLine('\n---\n'), title: '分割线' },
  ];

  const renderMarkdown = (markdown: string): string => {
    // 简单的Markdown渲染器
    let html = markdown
      // 标题
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // 代码块
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      
      // 内联代码
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      
      // 粗体和斜体
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // 图片
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      
      // 引用
      .replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>')
      
      // 水平分割线
      .replace(/^---$/gim, '<hr />')
      
      // 无序列表
      .replace(/^\- (.*)$/gim, '<li>$1</li>')
      
      // 有序列表
      .replace(/^\d+\. (.*)$/gim, '<li>$1</li>')
      
      // 段落
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.*)$/gim, '<p>$1</p>')
      
      // 清理多余的段落标签
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<hr \/>)<\/p>/g, '$1')
      .replace(/<p>(<ul>.*<\/ul>)<\/p>/g, '$1')
      .replace(/<p>(<ol>.*<\/ol>)<\/p>/g, '$1')
      .replace(/<p>(<blockquote>.*<\/blockquote>)<\/p>/g, '$1')
      .replace(/<p>(<pre>.*<\/pre>)<\/p>/g, '$1');

    return html;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const downloadMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'document.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadHtml = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
${renderMarkdown(content)}
</body>
</html>`;
    
    const element = document.createElement('a');
    const file = new Blob([html], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = 'document.html';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const loadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/markdown' || file?.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContent(text);
      };
      reader.readAsText(file);
    }
  };

  const clearContent = () => {
    setContent('');
    textareaRef.current?.focus();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <ToolLayout>
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
        <div className={`${isFullscreen ? 'h-full flex flex-col p-6' : ''}`}>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Markdown编辑器
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              实时预览的Markdown编辑器，支持语法高亮和导出
            </p>
          </div>

          {/* 工具栏 */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              {/* 格式化按钮 */}
              <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-3 mr-3">
                {formatActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title={action.title}
                  >
                    <action.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>

              {/* 视图控制 */}
              <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-3 mr-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`p-2 rounded transition-colors ${
                    showPreview 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="切换预览"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="全屏模式"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* 文件操作 */}
              <div className="flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.markdown"
                  onChange={loadFile}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="加载文件"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="复制到剪贴板"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadMarkdown}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="下载Markdown"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadHtml}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="下载HTML"
                >
                  <Type className="w-4 h-4" />
                </button>
                <button
                  onClick={clearContent}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="清空内容"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 编辑器区域 */}
          <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} ${isFullscreen ? 'flex-1' : ''}`}>
            {/* 编辑器 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  编辑器
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {content.length} 字符 | {content.split('\n').length} 行
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isFullscreen ? 'h-full' : 'h-96'
                }`}
                placeholder="在这里输入您的Markdown内容..."
              />
            </div>

            {/* 预览 */}
            {showPreview && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  预览
                </h3>
                <div 
                  className={`p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 overflow-auto prose prose-sm max-w-none dark:prose-invert ${
                    isFullscreen ? 'h-full' : 'h-96'
                  }`}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                />
              </div>
            )}
          </div>

          {/* 复制成功提示 */}
          {copied && (
            <div className="fixed bottom-4 right-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm">
              内容已复制到剪贴板
            </div>
          )}
        </div>
      </div>

      {/* 使用说明 */}
      {!isFullscreen && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Markdown语法速查
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">标题</h4>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded">
                # 一级标题<br/>
                ## 二级标题<br/>
                ### 三级标题
              </code>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">强调</h4>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded">
                **粗体**<br/>
                *斜体*<br/>
                `代码`
              </code>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">链接</h4>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded">
                [链接文本](URL)<br/>
                ![图片](URL)
              </code>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">列表</h4>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded">
                - 无序列表<br/>
                1. 有序列表
              </code>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">引用</h4>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded">
                &gt; 引用内容
              </code>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">代码块</h4>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded">
                ```语言<br/>
                代码内容<br/>
                ```
              </code>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}