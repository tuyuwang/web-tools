'use client'

import { useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ToolLayout } from '@/components/tool-layout';
import { Upload, Download, Scissors, Layers } from 'lucide-react';

export default function PdfToolsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitRange, setSplitRange] = useState('1-1');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    setResultUrl('');
  };

  const readFileAsArrayBuffer = (file: File) => file.arrayBuffer();

  const merge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    try {
      const outPdf = await PDFDocument.create();
      for (const f of files) {
        const bytes = await readFileAsArrayBuffer(f);
        const src = await PDFDocument.load(bytes);
        const pages = await outPdf.copyPages(src, src.getPageIndices());
        pages.forEach((p) => outPdf.addPage(p));
      }
      const outBytes = await outPdf.save();
      const arr = new Uint8Array(outBytes);
      const blob = new Blob([arr], { type: 'application/pdf' });
      setResultUrl(URL.createObjectURL(blob));
    } finally {
      setIsProcessing(false);
    }
  };

  const split = async () => {
    if (files.length !== 1) return;
    setIsProcessing(true);
    try {
      const [startStr, endStr] = splitRange.split('-');
      const start = Math.max(1, parseInt(startStr || '1', 10));
      const end = parseInt(endStr || startStr || '1', 10);
      const inputBytes = await readFileAsArrayBuffer(files[0]);
      const src = await PDFDocument.load(inputBytes);
      const total = src.getPageCount();
      const s = Math.min(Math.max(1, start), total) - 1;
      const e = Math.min(Math.max(1, end), total) - 1;
      const indices = [] as number[];
      for (let i = Math.min(s, e); i <= Math.max(s, e); i++) indices.push(i);

      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, indices);
      copied.forEach((p) => out.addPage(p));
      const outBytes = await out.save();
      const arr = new Uint8Array(outBytes);
      const blob = new Blob([arr], { type: 'application/pdf' });
      setResultUrl(URL.createObjectURL(blob));
    } finally {
      setIsProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'output.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">PDF 工具（合并/拆分）</h1>
          <p className="text-gray-600 dark:text-gray-400">基于 pdf-lib，完全在浏览器本地处理</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <input ref={fileInputRef} type="file" accept="application/pdf" multiple onChange={onSelect} className="hidden" />
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div className="mt-4 space-y-2">
                <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  选择 PDF 文件
                </button>
                <div className="text-xs text-gray-500 dark:text-gray-400">合并至少选择两份；拆分只选择一份</div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="font-medium mb-2">已选择文件（{files.length}）</div>
                <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5 space-y-1">
                  {files.map((f) => (
                    <li key={f.name}>{f.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={merge}
                disabled={isProcessing || files.length < 2}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
              >
                <Layers className="h-4 w-4" /> 合并PDF
              </button>

              <div className="flex items-center gap-2">
                <input
                  value={splitRange}
                  onChange={(e) => setSplitRange(e.target.value)}
                  placeholder="页码范围 如 1-3"
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  onClick={split}
                  disabled={isProcessing || files.length !== 1}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  <Scissors className="h-4 w-4" /> 拆分导出
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center min-h-64 flex items-center justify-center">
              {resultUrl ? (
                <iframe src={resultUrl} className="w-full h-80 rounded" />
              ) : (
                <div className="text-gray-500">处理结果将在此预览</div>
              )}
            </div>
            {resultUrl && (
              <button onClick={download} className="btn btn-primary flex items-center gap-2">
                <Download className="h-4 w-4" /> 下载结果
              </button>
            )}
            {isProcessing && <div className="text-sm text-gray-500">处理中...</div>}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">说明</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• 所有操作均在本地浏览器完成，不上传文件</li>
            <li>• 合并时按选择顺序合并全部页面</li>
            <li>• 拆分支持选择页码区间（如 3-5）</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}