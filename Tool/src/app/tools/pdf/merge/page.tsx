'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { Download, FileText, X, ArrowUp, ArrowDown, Trash2, Upload } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  pages: number;
}

export default function PDFMergePage() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const pdfFiles: PDFFile[] = [];
    
    for (const file of acceptedFiles) {
      if (file.type === 'application/pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const pageCount = pdfDoc.getPageCount();
          
          pdfFiles.push({
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            pages: pageCount,
          });
        } catch (error) {
          console.error(`Error loading PDF ${file.name}:`, error);
        }
      }
    }
    
    setFiles(prev => [...prev, ...pdfFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
    // 清理下载链接
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
      setMergedPdfUrl(null);
    }
  };

  const moveFile = (id: string, direction: 'up' | 'down') => {
    const index = files.findIndex(file => file.id === id);
    if (index === -1) return;
    
    const newFiles = [...files];
    if (direction === 'up' && index > 0) {
      [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
    } else if (direction === 'down' && index < files.length - 1) {
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    }
    
    setFiles(newFiles);
  };

  const mergePDFs = async () => {
    if (files.length < 2) return;
    
    setIsProcessing(true);
    
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      }
      
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // 清理之前的URL
      if (mergedPdfUrl) {
        URL.revokeObjectURL(mergedPdfUrl);
      }
      
      setMergedPdfUrl(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('合并PDF时出错，请检查文件是否有效。');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadMergedPDF = () => {
    if (mergedPdfUrl) {
      const link = document.createElement('a');
      link.href = mergedPdfUrl;
      link.download = 'merged.pdf';
      link.click();
    }
  };

  const clearAll = () => {
    setFiles([]);
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
      setMergedPdfUrl(null);
    }
  };

  const totalPages = files.reduce((sum, file) => sum + file.pages, 0);

  return (
    <ToolLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PDF合并工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            将多个PDF文件合并为一个文件，支持拖拽排序，完全客户端处理
          </p>
        </div>

        {/* 文件上传区域 */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {isDragActive ? '松开鼠标上传文件' : '拖拽PDF文件到这里'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            或点击选择文件，支持同时选择多个PDF文件
          </p>
        </div>

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                已选择的文件 ({files.length}个, 共{totalPages}页)
              </h3>
              <button
                onClick={clearAll}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
              >
                清空所有
              </button>
            </div>
            
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {file.pages} 页
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => moveFile(file.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveFile(file.id, 'down')}
                      disabled={index === files.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 合并按钮 */}
            <div className="flex justify-center">
              <button
                onClick={mergePDFs}
                disabled={files.length < 2 || isProcessing}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    合并中...
                  </>
                ) : (
                  `合并 ${files.length} 个PDF文件`
                )}
              </button>
            </div>
          </div>
        )}

        {/* 下载区域 */}
        {mergedPdfUrl && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <div className="text-green-600 dark:text-green-400 mb-4">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">PDF合并完成！</p>
            </div>
            <button
              onClick={downloadMergedPDF}
              className="btn btn-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              下载合并后的PDF
            </button>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">使用说明：</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>• 支持拖拽或点击选择多个PDF文件</li>
            <li>• 可以调整文件顺序，上下箭头重新排序</li>
            <li>• 所有处理都在您的浏览器中进行，文件不会上传到服务器</li>
            <li>• 支持密码保护的PDF文件（需要先解除密码保护）</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}