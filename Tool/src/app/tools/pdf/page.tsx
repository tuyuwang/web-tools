'use client';

import { ToolCard } from '@/components/tool-card';
import { ToolLayout } from '@/components/tool-layout';
import { useLanguage } from '@/components/language-provider';

const pdfTools = [
  {
    id: 'pdf-compress',
    name: 'PDF压缩',
    description: '在线压缩PDF文件，减小文件大小，支持质量调节。',
    href: '/tools/pdf/compress',
    icon: 'FileText',
  },
  {
    id: 'pdf-merge',
    name: 'PDF合并',
    description: '将多个PDF文件合并为一个文件，支持拖拽排序。',
    href: '/tools/pdf/merge',
    icon: 'FileText',
  },
  {
    id: 'pdf-split',
    name: 'PDF分割',
    description: '将PDF文件分割成多个文件，支持按页数分割。',
    href: '/tools/pdf/split',
    icon: 'FileText',
  },
  {
    id: 'pdf-to-images',
    name: 'PDF转图片',
    description: '将PDF页面转换为PNG/JPG图片。',
    href: '/tools/pdf/to-images',
    icon: 'Image',
  },
  {
    id: 'images-to-pdf',
    name: '图片转PDF',
    description: '将多张图片合并成一个PDF文件。',
    href: '/tools/pdf/from-images',
    icon: 'FileText',
  },
  {
    id: 'pdf-rotate',
    name: 'PDF旋转',
    description: '旋转PDF页面，支持90度、180度旋转。',
    href: '/tools/pdf/rotate',
    icon: 'RotateCw',
  },
];

export default function PDFToolsPage() {
  const { t } = useLanguage();

  return (
    <ToolLayout>
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PDF工具集
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            完全客户端的PDF处理工具，无需上传文件到服务器，保护您的隐私
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {pdfTools.map((tool) => (
            <ToolCard
              key={tool.id}
              id={tool.id}
              name={tool.name}
              description={tool.description}
              href={tool.href}
              icon={tool.icon}
            />
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}