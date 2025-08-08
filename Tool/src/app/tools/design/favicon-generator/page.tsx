'use client';

import { useRef, useState } from 'react';
import JSZip from 'jszip';
import toICO from '2ico';
import { Upload, Download, RotateCcw, AlertCircle, CheckCircle, Copy, Info } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface GeneratedAsset {
  filename: string;
  sizePx: number | string;
  url: string;
  bytes: number;
}

export default function FaviconGeneratorPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [icoUrl, setIcoUrl] = useState<string>('');
  const [manifestJson, setManifestJson] = useState<string>('');
  const [htmlSnippet, setHtmlSnippet] = useState<string>('');

  const pngSizes = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512];
  const icoSizes = [16, 32, 48, 64, 128, 256];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    if (!file.type.startsWith('image/')) {
      setError('请选择有效的图片文件');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('文件大小不能超过20MB');
      return;
    }

    setSourceFile(file);
    setSourceUrl(URL.createObjectURL(file));
    setAssets([]);
    setIcoUrl('');
    setManifestJson('');
    setHtmlSnippet('');
  };

  const clearAll = () => {
    setSourceFile(null);
    setSourceUrl('');
    setAssets([]);
    setIcoUrl('');
    setManifestJson('');
    setHtmlSnippet('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const drawToCanvas = (img: HTMLImageElement, size: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法创建Canvas上下文');

    ctx.clearRect(0, 0, size, size);

    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    const srcRatio = srcW / srcH;
    const dstRatio = 1;

    let drawW = size;
    let drawH = size;
    if (srcRatio > dstRatio) {
      drawH = Math.round(size / srcRatio);
    } else if (srcRatio < dstRatio) {
      drawW = Math.round(size * srcRatio);
    }

    const dx = Math.round((size - drawW) / 2);
    const dy = Math.round((size - drawH) / 2);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, dx, dy, drawW, drawH);
    return canvas;
  };

  const canvasToBlob = (canvas: HTMLCanvasElement, type = 'image/png', quality?: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('导出图片失败'));
      }, type, quality);
    });

  const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    return await res.blob();
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generate = async () => {
    if (!sourceFile || !sourceUrl) return;
    setIsGenerating(true);
    setError('');

    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = sourceUrl;
      });

      const nextAssets: GeneratedAsset[] = [];

      for (const size of pngSizes) {
        const canvas = drawToCanvas(img, size);
        const blob = await canvasToBlob(canvas, 'image/png');
        const url = URL.createObjectURL(blob);
        nextAssets.push({
          filename: size === 180 ? 'apple-touch-icon.png' :
            size === 192 ? 'android-chrome-192x192.png' :
            size === 512 ? 'android-chrome-512x512.png' : `favicon-${size}x${size}.png`,
          sizePx: `${size}x${size}`,
          url,
          bytes: blob.size,
        });
      }

      const baseForIco = drawToCanvas(img, 256);
      const icoDataUrl = toICO(baseForIco, icoSizes);
      const icoBlob = await dataUrlToBlob(icoDataUrl);
      const icoObjectUrl = URL.createObjectURL(icoBlob);
      setIcoUrl(icoObjectUrl);

      nextAssets.unshift({ filename: 'favicon.ico', sizePx: icoSizes.join(','), url: icoObjectUrl, bytes: icoBlob.size });

      setAssets(nextAssets);

      const manifest = {
        name: 'Web App',
        short_name: 'App',
        icons: [
          { src: 'android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
      };
      const manifestStr = JSON.stringify(manifest, null, 2);
      setManifestJson(manifestStr);

      const html = [
        '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
        '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
        '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
        '<link rel="manifest" href="/site.webmanifest">',
      ].join('\n');
      setHtmlSnippet(html);
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadZip = async () => {
    if (assets.length === 0) return;
    const zip = new JSZip();
    for (const a of assets) {
      const res = await fetch(a.url);
      const blob = await res.blob();
      zip.file(a.filename, blob);
    }
    zip.file('site.webmanifest', manifestJson || '{}');
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'favicons.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <ToolLayout title="Favicon生成器" description="从图片生成网站常用的 favicon.ico 和多尺寸 PNG 图标，附带 HTML 与 Manifest 片段，支持一键打包下载。">
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">说明</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>所有处理均在本地浏览器完成，不会上传文件。</li>
                <li>建议上传正方形、透明背景的 PNG/SVG/JPEG，最大 20MB。</li>
                <li>自动生成 favicon.ico、16/32/48/64/96/128/180/192/256/512 PNG 文件与 site.webmanifest。</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">选择图片</h2>
              <button onClick={clearAll} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md">清空</button>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

              {!sourceFile ? (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">选择图片文件</button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">支持 PNG、JPEG、WebP、SVG 等格式；最大 20MB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <img src={sourceUrl} alt="原始图片" className="max-w-full max-h-64 object-contain rounded-lg mx-auto" />
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><strong>文件名:</strong> {sourceFile.name}</p>
                    <p><strong>大小:</strong> {formatBytes(sourceFile.size)}</p>
                    <p><strong>类型:</strong> {sourceFile.type}</p>
                  </div>
                </div>
              )}
            </div>

            {sourceFile && (
              <button onClick={generate} disabled={isGenerating} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center justify-center space-x-2">
                {isGenerating ? <RotateCcw className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                <span>{isGenerating ? '生成中...' : '生成图标与代码'}</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">生成结果</h2>

            {assets.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-green-800 dark:text-green-200 font-medium">生成成功</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">共 {assets.length} 个文件</p>
                </div>

                <div className="max-h-72 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
                  {assets.map((a) => (
                    <div key={a.filename} className="flex items-center justify-between p-3">
                      <div className="flex items-center space-x-3">
                        <img src={a.url} alt={a.filename} className="w-8 h-8 rounded" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{a.filename}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{typeof a.sizePx === 'string' ? a.sizePx : `${a.sizePx}x${a.sizePx}`} · {formatBytes(a.bytes)}</p>
                        </div>
                      </div>
                      <a href={a.url} download={a.filename} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>下载</span>
                      </a>
                    </div>
                  ))}
                </div>

                <button onClick={downloadZip} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>打包下载 ZIP</span>
                </button>

                {htmlSnippet && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-md font-semibold text-gray-900 dark:text-white">HTML 片段</h3>
                      <button onClick={() => copyToClipboard(htmlSnippet)} className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md flex items-center space-x-1">
                        <Copy className="h-4 w-4" />
                        <span>复制</span>
                      </button>
                    </div>
                    <pre className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 overflow-auto">{htmlSnippet}</pre>
                  </div>
                )}

                {manifestJson && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-md font-semibold text-gray-900 dark:text-white">site.webmanifest</h3>
                      <button onClick={() => copyToClipboard(manifestJson)} className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md flex items-center space-x-1">
                        <Copy className="h-4 w-4" />
                        <span>复制</span>
                      </button>
                    </div>
                    <pre className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 overflow-auto">{manifestJson}</pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">生成的图标与代码将显示在这里</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}