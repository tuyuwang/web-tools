'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { FileText, Upload, Download, ArrowRight, File, FileImage, FileVideo, FileAudio } from 'lucide-react';

interface FileFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  extensions: string[];
  category: string;
}

export default function FileConverterPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('');
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const fileFormats: FileFormat[] = [
    // 图片格式
    {
      id: 'image',
      name: '图片格式',
      description: '图片文件格式转换',
      icon: FileImage,
      extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'],
      category: 'image'
    },
    // 文档格式
    {
      id: 'document',
      name: '文档格式',
      description: '文档文件格式转换',
      icon: FileText,
      extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
      category: 'document'
    },
    // 视频格式
    {
      id: 'video',
      name: '视频格式',
      description: '视频文件格式转换',
      icon: FileVideo,
      extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
      category: 'video'
    },
    // 音频格式
    {
      id: 'audio',
      name: '音频格式',
      description: '音频文件格式转换',
      icon: FileAudio,
      extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'],
      category: 'audio'
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setConvertedFile(null);
    }
  };

  const getFileCategory = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    for (const format of fileFormats) {
      if (format.extensions.includes(extension || '')) {
        return format.category;
      }
    }
    return 'unknown';
  };

  const getAvailableFormats = (category: string): string[] => {
    const format = fileFormats.find(f => f.category === category);
    return format ? format.extensions : [];
  };

  const convertFile = async () => {
    if (!selectedFile || !targetFormat) return;

    setIsConverting(true);
    
    // 模拟文件转换过程
    setTimeout(() => {
      const originalName = selectedFile.name;
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
      const newFileName = `${nameWithoutExt}.${targetFormat}`;
      
      // 创建转换后的文件URL（模拟）
      const convertedUrl = URL.createObjectURL(selectedFile);
      setConvertedFile(convertedUrl);
      setIsConverting(false);
    }, 2000);
  };

  const downloadFile = () => {
    if (convertedFile) {
      const link = document.createElement('a');
      link.href = convertedFile;
      link.download = selectedFile?.name.replace(/\.[^/.]+$/, '') + '.' + targetFormat;
      link.click();
    }
  };

  const clearFiles = () => {
    setSelectedFile(null);
    setTargetFormat('');
    setConvertedFile(null);
  };

  const currentCategory = selectedFile ? getFileCategory(selectedFile.name) : '';
  const availableFormats = getAvailableFormats(currentCategory);

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          文件格式转换器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          支持图片、文档、视频、音频等多种文件格式的转换
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 文件上传区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              上传文件
            </h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept="*/*"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    点击上传文件或拖拽到此处
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    支持图片、文档、视频、音频等格式
                  </p>
                </label>
              </div>

              {selectedFile && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <File className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedFile && currentCategory !== 'unknown' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    选择目标格式
                  </label>
                  <select
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">选择格式</option>
                    {availableFormats.map((format) => (
                      <option key={format} value={format}>
                        {format.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={convertFile}
                    disabled={!targetFormat || isConverting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isConverting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        转换中...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        开始转换
                      </>
                    )}
                  </button>
                </div>
              )}

              {currentCategory === 'unknown' && selectedFile && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    不支持的文件格式，请选择其他文件
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 转换结果区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              转换结果
            </h2>
            
            {convertedFile ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="w-8 h-8 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        转换完成
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedFile?.name.replace(/\.[^/.]+$/, '')}.{targetFormat}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={downloadFile}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    下载文件
                  </button>
                  <button
                    onClick={clearFiles}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    重新开始
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="h-16 w-16 mb-4 text-gray-300" />
                <p>请先上传文件并选择目标格式</p>
              </div>
            )}
          </div>

          {/* 支持格式说明 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              支持的格式
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fileFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <div key={format.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {format.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format.extensions.join(', ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 