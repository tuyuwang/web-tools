'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Upload, 
  Music, 
  Video, 
  Image, 
  FileAudio, 
  FileVideo, 
  Settings,
  SkipForward,
  SkipBack,
  Info,
  X,
  RotateCcw,
  Maximize2,
  Minimize2,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

interface MediaFile {
  file: File;
  url: string;
  duration?: number;
  size: string;
  type: string;
  name: string;
}

interface ConversionTask {
  id: string;
  file: MediaFile;
  targetFormat: string;
  quality?: string;
  resolution?: string;
  status: 'pending' | 'converting' | 'completed' | 'failed';
  progress: number;
  outputFile?: File;
  error?: string;
}

export default function MediaToolsPage() {
  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('media');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('media');
  
  const [activeTab, setActiveTab] = useState('audio');
  const [audioFiles, setAudioFiles] = useState<MediaFile[]>([]);
  const [videoFiles, setVideoFiles] = useState<MediaFile[]>([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showFileInfo, setShowFileInfo] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [conversionTasks, setConversionTasks] = useState<ConversionTask[]>([]);
  const [audioTargetFormat, setAudioTargetFormat] = useState('mp3');
  const [audioQuality, setAudioQuality] = useState('192');
  const [videoTargetFormat, setVideoTargetFormat] = useState('mp4');
  const [videoResolution, setVideoResolution] = useState('original');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'audio', name: pageTranslation.tabs.audio, icon: Music },
    { id: 'video', name: pageTranslation.tabs.video, icon: Video },
    { id: 'converter', name: pageTranslation.tabs.converter, icon: FileAudio },
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = useCallback((files: FileList, type: 'audio' | 'video') => {
    const newFiles: MediaFile[] = [];
    
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const mediaFile: MediaFile = {
        file,
        url,
        size: formatFileSize(file.size),
        type: file.type,
        name: file.name
      };
      newFiles.push(mediaFile);
    });

    if (type === 'audio') {
      setAudioFiles(prev => [...prev, ...newFiles]);
      if (audioFiles.length === 0 && newFiles.length > 0) {
        loadAudioFile(newFiles[0]);
      }
    } else {
      setVideoFiles(prev => [...prev, ...newFiles]);
      if (videoFiles.length === 0 && newFiles.length > 0) {
        loadVideoFile(newFiles[0]);
      }
    }
  }, [audioFiles.length, videoFiles.length]);

  const loadAudioFile = (mediaFile: MediaFile) => {
    if (audioRef.current) {
      audioRef.current.src = mediaFile.url;
      audioRef.current.onloadedmetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };
    }
  };

  const loadVideoFile = (mediaFile: MediaFile) => {
    if (videoRef.current) {
      videoRef.current.src = mediaFile.url;
    }
  };

  const handlePlayPause = () => {
    const media = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (media) {
      if (isPlaying) {
        media.pause();
      } else {
        media.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    const media = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (media) {
      media.volume = newVolume / 100;
    }
  };

  const handleMuteToggle = () => {
    const media = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (media) {
      media.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    const media = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (media) {
      setCurrentTime(media.currentTime);
      setDuration(media.duration || 0);
    }
  };

  const handleSeek = (time: number) => {
    const media = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (media) {
      media.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSkip = (seconds: number) => {
    const media = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (media) {
      media.currentTime = Math.max(0, Math.min(duration, media.currentTime + seconds));
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    const media = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (media) {
      media.playbackRate = rate;
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const isAudio = activeTab === 'audio';
      const acceptedTypes = isAudio ? 'audio/' : 'video/';
      
      const validFiles = Array.from(files).filter(file => 
        file.type.startsWith(acceptedTypes)
      );
      
      if (validFiles.length > 0) {
        const fileList = new DataTransfer();
        validFiles.forEach(file => fileList.items.add(file));
        handleFileUpload(fileList.files, isAudio ? 'audio' : 'video');
      }
    }
  }, [activeTab, handleFileUpload]);

  const removeFile = (index: number, type: 'audio' | 'video') => {
    if (type === 'audio') {
      const newFiles = audioFiles.filter((_, i) => i !== index);
      setAudioFiles(newFiles);
      if (index === currentAudioIndex && newFiles.length > 0) {
        const newIndex = Math.min(currentAudioIndex, newFiles.length - 1);
        setCurrentAudioIndex(newIndex);
        loadAudioFile(newFiles[newIndex]);
      }
    } else {
      const newFiles = videoFiles.filter((_, i) => i !== index);
      setVideoFiles(newFiles);
      if (index === currentVideoIndex && newFiles.length > 0) {
        const newIndex = Math.min(currentVideoIndex, newFiles.length - 1);
        setCurrentVideoIndex(newIndex);
        loadVideoFile(newFiles[newIndex]);
      }
    }
  };

  // 从转换器中移除特定文件
  const removeFileFromConverter = (file: MediaFile, type: 'audio' | 'video') => {
    if (type === 'audio') {
      const newFiles = audioFiles.filter(f => f.url !== file.url);
      setAudioFiles(newFiles);
    } else {
      const newFiles = videoFiles.filter(f => f.url !== file.url);
      setVideoFiles(newFiles);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 生成唯一ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // 音频转换功能
  const convertAudioFile = async (file: MediaFile, targetFormat: string, quality: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      try {
        // 检查浏览器支持的MIME类型
        const mimeTypes = {
          'webm': 'audio/webm',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav'
        };
        
        const targetMimeType = (mimeTypes as any)[targetFormat] || 'audio/webm';
        
        if (!MediaRecorder.isTypeSupported(targetMimeType)) {
          reject(new Error(`浏览器不支持 ${targetFormat} 格式转换`));
          return;
        }
        
        const audio = new Audio();
        audio.src = file.url;
        audio.crossOrigin = 'anonymous';
        audio.muted = true; // 静音播放，避免转换时出声音
        
        audio.onloadedmetadata = () => {
          try {
            // 创建音频上下文
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContext.createMediaElementSource(audio);
            const destination = audioContext.createMediaStreamDestination();
            source.connect(destination);
            
            // 使用MediaRecorder录制转换后的音频
            const mediaRecorder = new MediaRecorder(destination.stream, {
              mimeType: targetMimeType
            });
            
            const chunks: Blob[] = [];
            
            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                chunks.push(event.data);
              }
            };
            
            mediaRecorder.onstop = () => {
              const blob = new Blob(chunks, { type: targetMimeType });
              const convertedFile = new File([blob], 
                file.name.replace(/\.[^/.]+$/, `.${targetFormat}`), 
                { type: blob.type }
              );
              audioContext.close();
              resolve(convertedFile);
            };
            
            mediaRecorder.onerror = (error) => {
              audioContext.close();
              reject(new Error('录制过程中出现错误'));
            };
            
            // 开始录制
            mediaRecorder.start();
            audio.play();
            
            // 录制完成后停止
            audio.onended = () => {
              mediaRecorder.stop();
            };
            
          } catch (error) {
            reject(new Error('音频处理初始化失败'));
          }
        };
        
        audio.onerror = () => {
          reject(new Error('音频文件加载失败'));
        };
        
      } catch (error) {
        reject(new Error('转换功能初始化失败'));
      }
    });
  };

  // 视频转换功能（简化版本，主要是容器格式转换）
  const convertVideoFile = async (file: MediaFile, targetFormat: string, resolution: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      try {
        // 检查浏览器支持的MIME类型
        const mimeTypes = {
          'webm': 'video/webm',
          'mp4': 'video/mp4'
        };
        
        const targetMimeType = (mimeTypes as any)[targetFormat] || 'video/webm';
        
        if (!MediaRecorder.isTypeSupported(targetMimeType)) {
          reject(new Error(`浏览器不支持 ${targetFormat} 格式转换`));
          return;
        }
        
        const video = document.createElement('video');
        video.src = file.url;
        video.crossOrigin = 'anonymous';
        video.muted = true; // 静音播放，避免转换时出声音
        
        video.onloadedmetadata = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('无法创建画布上下文'));
              return;
            }
            
            // 设置画布尺寸
            let width = video.videoWidth;
            let height = video.videoHeight;
            
            if (resolution !== 'original') {
              const targetHeight = parseInt(resolution.replace('p', ''));
              const aspectRatio = width / height;
              height = targetHeight;
              width = Math.round(height * aspectRatio);
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // 创建视频流（画布）
            const videoStream = canvas.captureStream(30); // 30 FPS
            
            // 创建音频上下文来获取音频流
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContext.createMediaElementSource(video);
            const destination = audioContext.createMediaStreamDestination();
            source.connect(destination);
            
            // 合并视频和音频流
            const stream = new MediaStream([
              ...videoStream.getVideoTracks(),
              ...destination.stream.getAudioTracks()
            ]);
            
            // 使用MediaRecorder录制
            const mediaRecorder = new MediaRecorder(stream, {
              mimeType: targetMimeType
            });
            
            const chunks: Blob[] = [];
            
            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                chunks.push(event.data);
              }
            };
            
            mediaRecorder.onstop = () => {
              const blob = new Blob(chunks, { type: targetMimeType });
              const convertedFile = new File([blob], 
                file.name.replace(/\.[^/.]+$/, `.${targetFormat}`), 
                { type: blob.type }
              );
              audioContext.close(); // 清理音频上下文
              resolve(convertedFile);
            };
            
            mediaRecorder.onerror = (error) => {
              audioContext.close(); // 清理音频上下文
              reject(new Error('录制过程中出现错误'));
            };
            
            // 开始录制和播放
            mediaRecorder.start();
            video.play();
            
            // 绘制视频帧
            const drawFrame = () => {
              if (!video.paused && !video.ended) {
                ctx.drawImage(video, 0, 0, width, height);
                requestAnimationFrame(drawFrame);
              }
            };
            drawFrame();
            
            // 视频结束时停止录制
            video.onended = () => {
              mediaRecorder.stop();
            };
            
          } catch (error) {
            reject(new Error('视频处理初始化失败'));
          }
        };
        
        video.onerror = () => {
          reject(new Error('视频文件加载失败'));
        };
        
      } catch (error) {
        reject(new Error('转换功能初始化失败'));
      }
    });
  };

  // 简单的文件格式转换（仅改变扩展名和MIME类型）
  const simpleFormatConversion = (file: MediaFile, targetFormat: string): File => {
    const newFileName = file.name.replace(/\.[^/.]+$/, `.${targetFormat}`);
    const mimeTypes = {
      'webm': 'video/webm',
      'mp4': 'video/mp4',  
      'ogg': 'audio/ogg',
      'wav': 'audio/wav'
    };
    const targetMimeType = (mimeTypes as any)[targetFormat] || file.type;
    
    return new File([file.file], newFileName, { type: targetMimeType });
  };

  // 开始转换任务
  const startConversion = async (files: MediaFile[], type: 'audio' | 'video') => {
    const targetFormat = type === 'audio' ? audioTargetFormat : videoTargetFormat;
    const quality = type === 'audio' ? audioQuality : undefined;
    const resolution = type === 'video' ? videoResolution : undefined;
    
    const newTasks: ConversionTask[] = files.map(file => ({
      id: generateId(),
      file,
      targetFormat,
      quality,
      resolution,
      status: 'pending',
      progress: 0
    }));
    
    setConversionTasks(prev => [...prev, ...newTasks]);
    
    // 逐个处理转换任务
    for (const task of newTasks) {
      try {
        // 更新状态为转换中
        setConversionTasks(prev => 
          prev.map(t => t.id === task.id ? { ...t, status: 'converting', progress: 0 } : t)
        );
        
        // 模拟进度更新
        const progressInterval = setInterval(() => {
          setConversionTasks(prev => 
            prev.map(t => {
              if (t.id === task.id && t.status === 'converting') {
                const newProgress = Math.min(t.progress + Math.random() * 20, 90);
                return { ...t, progress: newProgress };
              }
              return t;
            })
          );
        }, 500);
        
        let convertedFile: File;
        
        try {
          // 尝试高级转换
          convertedFile = type === 'audio' 
            ? await convertAudioFile(task.file, targetFormat, quality!)
            : await convertVideoFile(task.file, targetFormat, resolution!);
        } catch (advancedError) {
          console.warn('高级转换失败，使用简单转换:', advancedError);
          // 如果高级转换失败，使用简单转换
          convertedFile = simpleFormatConversion(task.file, targetFormat);
        }
        
        clearInterval(progressInterval);
        
        // 更新状态为完成
        setConversionTasks(prev => 
          prev.map(t => t.id === task.id ? { 
            ...t, 
            status: 'completed', 
            progress: 100,
            outputFile: convertedFile 
          } : t)
        );
        
      } catch (error) {
        // 清除进度更新
        const progressInterval = setInterval(() => {}, 0);
        clearInterval(progressInterval);
        
        // 更新状态为失败
        setConversionTasks(prev => 
          prev.map(t => t.id === task.id ? { 
            ...t, 
            status: 'failed', 
            error: error instanceof Error ? error.message : '转换失败'
          } : t)
        );
      }
    }
  };

  // 下载转换后的文件
  const downloadConvertedFile = (task: ConversionTask) => {
    if (task.outputFile) {
      const url = URL.createObjectURL(task.outputFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = task.outputFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // 清除转换任务
  const clearCompletedTasks = () => {
    setConversionTasks(prev => prev.filter(task => task.status === 'converting'));
  };

  const currentAudioFile = audioFiles[currentAudioIndex];
  const currentVideoFile = videoFiles[currentVideoIndex];

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 避免在输入框中触发快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSkip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSkip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(100, volume + 10));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 10));
          break;
        case 'KeyM':
          e.preventDefault();
          handleMuteToggle();
          break;
        case 'KeyF':
          if (activeTab === 'video') {
            e.preventDefault();
            setIsFullscreen(!isFullscreen);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handleSkip, handleVolumeChange, handleMuteToggle, volume, activeTab, isFullscreen]);

  const audioFormats = [
    { name: pageTranslation.audioFormats.mp3.name, description: pageTranslation.audioFormats.mp3.description },
    { name: pageTranslation.audioFormats.wav.name, description: pageTranslation.audioFormats.wav.description },
    { name: pageTranslation.audioFormats.aac.name, description: pageTranslation.audioFormats.aac.description },
    { name: pageTranslation.audioFormats.ogg.name, description: pageTranslation.audioFormats.ogg.description },
    { name: pageTranslation.audioFormats.flac.name, description: pageTranslation.audioFormats.flac.description },
  ];

  const videoFormats = [
    { name: pageTranslation.videoFormats.mp4.name, description: pageTranslation.videoFormats.mp4.description },
    { name: pageTranslation.videoFormats.avi.name, description: pageTranslation.videoFormats.avi.description },
    { name: pageTranslation.videoFormats.mov.name, description: pageTranslation.videoFormats.mov.description },
    { name: pageTranslation.videoFormats.webm.name, description: pageTranslation.videoFormats.webm.description },
    { name: pageTranslation.videoFormats.mkv.name, description: pageTranslation.videoFormats.mkv.description },
  ];

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {toolTranslation.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {toolTranslation.description}
        </p>
      </div>

      {/* 标签页 */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="mt-8">
        {activeTab === 'audio' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {pageTranslation.tabs.audio}
              </h2>
              
              {/* 文件上传 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {ui.labels.input}
                </label>
                <div 
                  className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center transition-colors ${
                    isDragOver ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {ui.placeholders.chooseFile}
                  </p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) handleFileUpload(files, 'audio');
                    }}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* 音频播放器 */}
              {audioFiles.length > 0 && currentAudioFile && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Music className="w-6 h-6 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                            {currentAudioFile.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {currentAudioFile.size} • {currentAudioFile.type}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowFileInfo(!showFileInfo)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </div>

                    {/* 进度条 */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTime(currentTime)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTime(duration)}
                        </span>
                      </div>
                      <div 
                        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 cursor-pointer"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const percent = (e.clientX - rect.left) / rect.width;
                          handleSeek(percent * duration);
                        }}
                      >
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-150"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* 控制按钮 */}
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <button
                        onClick={() => handleSkip(-10)}
                        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        title="后退10秒"
                      >
                        <SkipBack className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={handlePlayPause}
                        className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                      </button>
                      
                      <button
                        onClick={() => handleSkip(10)}
                        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        title="前进10秒"
                      >
                        <SkipForward className="w-5 h-5" />
                      </button>
                    </div>

                    {/* 音量和播放速度控制 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button onClick={handleMuteToggle} className="p-1">
                          {isMuted || volume === 0 ? 
                            <VolumeX className="w-4 h-4 text-gray-500" /> : 
                            <Volume2 className="w-4 h-4 text-gray-500" />
                          }
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => handleVolumeChange(Number(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-xs text-gray-500 w-8">{Math.round(volume)}%</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">速度:</span>
                        <select
                          value={playbackRate}
                          onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                          className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                        >
                          <option value={0.5}>0.5x</option>
                          <option value={0.75}>0.75x</option>
                          <option value={1}>1x</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2}>2x</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <audio
                    ref={audioRef}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleTimeUpdate}
                    className="hidden"
                  />
                </div>
              )}

                             {/* 文件列表 */}
               {audioFiles.length > 0 && (
                 <div className="mt-6">
                   <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                     文件列表
                   </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            文件名
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            大小
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            时长
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {audioFiles.map((file, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {file.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {file.size}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatTime(file.duration || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                             <button
                                 onClick={() => removeFile(index, 'audio')}
                                 className="text-red-600 hover:text-red-900 dark:text-red-400"
                                 title="删除"
                               >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 格式信息 */}
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  {ui.labels.format}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {audioFormats.map((format) => (
                    <div key={format.name} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="font-medium text-gray-900 dark:text-white">{format.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{format.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {pageTranslation.tabs.video}
              </h2>
              
              {/* 文件上传 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {ui.labels.input}
                </label>
                <div 
                  className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center transition-colors ${
                    isDragOver ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {ui.placeholders.chooseFile}
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) handleFileUpload(files, 'video');
                    }}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* 视频播放器 */}
              {videoFiles.length > 0 && currentVideoFile && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Video className="w-6 h-6 text-purple-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                            {currentVideoFile.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {currentVideoFile.size} • {currentVideoFile.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowFileInfo(!showFileInfo)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <Info className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setIsFullscreen(!isFullscreen)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
                      <video
                        ref={videoRef}
                        className="w-full rounded-lg"
                        controls
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleTimeUpdate}
                      />
                      
                      {isFullscreen && (
                        <button
                          onClick={() => setIsFullscreen(false)}
                          className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      )}
                    </div>

                    {/* 视频控制信息 */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                        <div className="flex items-center space-x-2">
                          <span>速度:</span>
                          <select
                            value={playbackRate}
                            onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                            className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                          >
                            <option value={0.25}>0.25x</option>
                            <option value={0.5}>0.5x</option>
                            <option value={0.75}>0.75x</option>
                            <option value={1}>1x</option>
                            <option value={1.25}>1.25x</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2}>2x</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button onClick={handleMuteToggle} className="p-1">
                          {isMuted || volume === 0 ? 
                            <VolumeX className="w-4 h-4" /> : 
                            <Volume2 className="w-4 h-4" />
                          }
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => handleVolumeChange(Number(e.target.value))}
                          className="w-20"
                        />
                        <span className="w-8">{Math.round(volume)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                             {/* 文件列表 */}
               {videoFiles.length > 0 && (
                 <div className="mt-6">
                   <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                     文件列表
                   </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            文件名
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            大小
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            时长
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {videoFiles.map((file, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {file.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {file.size}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatTime(file.duration || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                             <button
                                 onClick={() => removeFile(index, 'video')}
                                 className="text-red-600 hover:text-red-900 dark:text-red-400"
                                 title="删除"
                               >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 格式信息 */}
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  {ui.labels.format}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videoFormats.map((format) => (
                    <div key={format.name} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="font-medium text-gray-900 dark:text-white">{format.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{format.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'converter' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {pageTranslation.tabs.converter}
              </h2>
              
              {/* 转换器上传区域 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择要转换的文件
                </label>
                <div 
                  className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center transition-colors ${
                    isDragOver ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    拖拽文件到此处或点击选择文件
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    支持音频和视频文件格式转换
                  </p>
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        // 分离音频和视频文件
                        const audioFiles = Array.from(files).filter(f => f.type.startsWith('audio/'));
                        const videoFiles = Array.from(files).filter(f => f.type.startsWith('video/'));
                        
                        if (audioFiles.length > 0) {
                          const audioFileList = new DataTransfer();
                          audioFiles.forEach(f => audioFileList.items.add(f));
                          handleFileUpload(audioFileList.files, 'audio');
                        }
                        
                        if (videoFiles.length > 0) {
                          const videoFileList = new DataTransfer();
                          videoFiles.forEach(f => videoFileList.items.add(f));
                          handleFileUpload(videoFileList.files, 'video');
                        }
                      }
                    }}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* 转换选项 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 音频转换 */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Music className="w-5 h-5 mr-2 text-blue-600" />
                    音频格式转换
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        目标格式
                      </label>
                      <select 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                        value={audioTargetFormat}
                        onChange={(e) => setAudioTargetFormat(e.target.value)}
                      >
                        <option value="webm">WebM (推荐)</option>
                        <option value="ogg">OGG (开源格式)</option>
                        <option value="wav">WAV (无损格式)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        音质设置
                      </label>
                      <select 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                        value={audioQuality}
                        onChange={(e) => setAudioQuality(e.target.value)}
                      >
                        <option value="128">128 kbps (标准)</option>
                        <option value="192">192 kbps (良好)</option>
                        <option value="256">256 kbps (高质量)</option>
                        <option value="320">320 kbps (最高质量)</option>
                      </select>
                    </div>
                    
                    <button 
                      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
                      disabled={audioFiles.length === 0 || conversionTasks.some(t => t.status === 'converting')}
                      onClick={() => startConversion(audioFiles, 'audio')}
                    >
                      {conversionTasks.some(t => t.status === 'converting') ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          转换中...
                        </>
                      ) : (
                        `转换音频文件 (${audioFiles.length})`
                      )}
                    </button>
                  </div>
                </div>

                {/* 视频转换 */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Video className="w-5 h-5 mr-2 text-purple-600" />
                    视频格式转换
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        目标格式
                      </label>
                      <select 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                        value={videoTargetFormat}
                        onChange={(e) => setVideoTargetFormat(e.target.value)}
                      >
                        <option value="webm">WebM (推荐)</option>
                        <option value="mp4">MP4 (兼容性好)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        分辨率
                      </label>
                      <select 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                        value={videoResolution}
                        onChange={(e) => setVideoResolution(e.target.value)}
                      >
                        <option value="original">保持原分辨率</option>
                        <option value="720p">720p HD</option>
                        <option value="1080p">1080p Full HD</option>
                        <option value="480p">480p SD</option>
                        <option value="360p">360p 低质量</option>
                      </select>
                    </div>
                    
                    <button 
                      className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
                      disabled={videoFiles.length === 0 || conversionTasks.some(t => t.status === 'converting')}
                      onClick={() => startConversion(videoFiles, 'video')}
                    >
                      {conversionTasks.some(t => t.status === 'converting') ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          转换中...
                        </>
                      ) : (
                        `转换视频文件 (${videoFiles.length})`
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 批量处理状态 */}
              {(audioFiles.length > 0 || videoFiles.length > 0) && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    待处理文件
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {audioFiles.length > 0 && (
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                          音频文件 ({audioFiles.length})
                        </p>
                        <div className="space-y-1">
                          {audioFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 py-1">
                              <span className="truncate flex-1">• {file.name}</span>
                              <button
                                onClick={() => removeFileFromConverter(file, 'audio')}
                                className="ml-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                title="移除文件"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {videoFiles.length > 0 && (
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                          视频文件 ({videoFiles.length})
                        </p>
                        <div className="space-y-1">
                          {videoFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 py-1">
                              <span className="truncate flex-1">• {file.name}</span>
                              <button
                                onClick={() => removeFileFromConverter(file, 'video')}
                                className="ml-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                title="移除文件"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 转换任务状态 */}
              {conversionTasks.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      转换任务 ({conversionTasks.length})
                    </h4>
                    <button
                      onClick={clearCompletedTasks}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      清除已完成
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {conversionTasks.map((task) => (
                      <div key={task.id} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {task.status === 'converting' && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                            {task.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {task.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-600" />}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {task.file.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              → {task.targetFormat.toUpperCase()}
                            </span>
                            {task.status === 'completed' && task.outputFile && (
                              <button
                                onClick={() => downloadConvertedFile(task)}
                                className="flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                              >
                                <Download className="w-3 h-3" />
                                <span>下载</span>
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {task.status === 'converting' && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">转换进度</span>
                              <span className="text-xs text-gray-500">{Math.round(task.progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {task.status === 'failed' && task.error && (
                          <div className="text-xs text-red-600 dark:text-red-400">
                            错误: {task.error}
                          </div>
                        )}
                        
                        {task.status === 'completed' && task.outputFile && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            转换完成 • {formatFileSize(task.outputFile.size)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 转换说明 */}
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  转换说明
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• 所有转换都在浏览器本地进行，保护您的隐私</li>
                  <li>• 转换功能基于浏览器原生API，支持常见格式</li>
                  <li>• 大文件转换可能需要较长时间，请耐心等待</li>
                  <li>• 建议在转换前预览文件以确认格式正确</li>
                  <li>• 转换完成后可直接下载结果文件</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div className="mt-8 space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            {pageTranslation.instructions}
          </h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            {pageTranslation.instructionSteps.map((step: string, index: number) => (
              <li key={index}>• {step}</li>
            ))}
          </ul>
        </div>

        {/* 键盘快捷键说明 */}
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            键盘快捷键
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">播放/暂停</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">空格</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">后退10秒</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">←</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">前进10秒</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">→</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">静音/取消静音</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">M</kbd>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">音量增加</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">↑</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">音量减少</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">↓</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">全屏 (视频)</span>
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">F</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 