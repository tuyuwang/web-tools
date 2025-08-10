'use client'

import dynamic from 'next/dynamic'
import { ToolLayout } from '@/components/tool-layout'
import '@excalidraw/excalidraw/dist/excalidraw.css'

const Excalidraw = dynamic(async () => (await import('@excalidraw/excalidraw')).Excalidraw, {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[60vh] text-gray-500">
      加载白板中...
    </div>
  ),
})

export default function ExcalidrawToolPage() {
  return (
    <ToolLayout title="Excalidraw 白板" description="开源手绘风格白板，支持图形、文本与连接线，数据保存在本地浏览器。">
      <div className="h-[75vh] bg-white rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <Excalidraw />
      </div>
    </ToolLayout>
  )
}