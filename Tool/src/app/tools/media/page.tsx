'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Upload, 
  Music, 
  Video, 
  FileAudio, 
  FileVideo, 
  Settings,
  SkipForward,
  SkipBack,
  Info,
  X,
  RotateCcw,
  Maximize2,
  Loader2,
  Eye
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
  lastModified: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    hasAudio?: boolean;
    audioTracks?: number;
    videoCodec?: string;
    audioCodec?: string;
    bitrate?: number;
    frameRate?: number;
    sampleRate?: number;
    channels?: number;
    aspectRatio?: string;
  };
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

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const tabs = [
    { id: 'audio', name: '音频播放器', icon: Music },
    { id: 'video', name: '视频播放器', icon: Video },
    { id: 'metadata', name: '媒体信息', icon: Info },
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 获取媒体文件元数据
  const getMediaMetadata = useCallback((file: File, url: string): Promise<MediaFile> => {
    return new Promise((resolve) => {
      const mediaFile: MediaFile = {
        file,
        url,
        size: formatFileSize(file.size),
        type: file.type,
        name: file.name,
        lastModified: new Date(file.lastModified).toLocaleString('zh-CN'),
        metadata: {}
      };

      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = url;
        video.onloadedmetadata = () => {
          mediaFile.duration = video.duration;
          const aspectRatio = video.videoWidth && video.videoHeight 
            ? `${(video.videoWidth / video.videoHeight).toFixed(2)}:1`
            : '';
          
          mediaFile.metadata = {
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration,
            aspectRatio,
            hasAudio: !!(video as any).mozHasAudio || 
                     !!(video as any).webkitAudioDecodedByteCount ||
                     !!((video as any).audioTracks && (video as any).audioTracks.length > 0)
          };
          resolve(mediaFile);
        };
        video.onerror = () => resolve(mediaFile);
      } else if (file.type.startsWith('audio/')) {
        const audio = new Audio();
        audio.src = url;
        
        // 尝试获取音频上下文信息
        const tryGetAudioInfo = () => {
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = ctx.createMediaElementSource(audio);
            const analyser = ctx.createAnalyser();
            source.connect(analyser);
            analyser.connect(ctx.destination);
            
            mediaFile.metadata = {
              duration: audio.duration,
              hasAudio: true,
              sampleRate: ctx.sampleRate,
              channels: 2 // 默认立体声，实际检测较复杂
            };
          } catch (error) {
            mediaFile.metadata = {
              duration: audio.duration,
              hasAudio: true
            };
          }
          resolve(mediaFile);
        };
        
        audio.onloadedmetadata = tryGetAudioInfo;
        audio.onerror = () => resolve(mediaFile);
      } else {
        resolve(mediaFile);
      }
    });
  }, []);

  const handleFileUpload = useCallback(async (files: FileList, type: 'audio' | 'video') => {
    setUploadError('');
    const newFiles: MediaFile[] = [];
    const invalidFiles: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 检查文件类型
      if (type === 'audio' && !file.type.startsWith('audio/')) {
        invalidFiles.push(file.name + ' (不是音频文件)');
        continue;
      }
      if (type === 'video' && !file.type.startsWith('video/')) {
        invalidFiles.push(file.name + ' (不是视频文件)');
        continue;
      }
      
      // 检查文件大小 (限制为100MB)
      if (file.size > 100 * 1024 * 1024) {
        invalidFiles.push(file.name + ' (文件过大，超过100MB)');
        continue;
      }
      
      try {
        const url = URL.createObjectURL(file);
        const mediaFile = await getMediaMetadata(file, url);
        newFiles.push(mediaFile);
      } catch (error) {
        invalidFiles.push(file.name + ' (处理失败)');
        console.error('文件处理错误:', error);
      }
    }
    
    // 显示错误信息
    if (invalidFiles.length > 0) {
      setUploadError(`以下文件无法处理: ${invalidFiles.join(', ')}`);
    }
    
    // 添加有效文件
    if (newFiles.length > 0) {
      if (type === 'audio') {
        setAudioFiles(prev => [...prev, ...newFiles]);
      } else {
        setVideoFiles(prev => [...prev, ...newFiles]);
      }
    }
  }, [getMediaMetadata]);

  const handlePlayPause = useCallback(() => {
    const media = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
    setIsPlaying(!isPlaying);
  }, [activeTab, isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    const media = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (media) {
      setCurrentTime(media.currentTime);
      setDuration(media.duration || 0);
    }
  }, [activeTab]);

  const handleSeek = useCallback((time: number) => {
    const media = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (media) {
      media.currentTime = time;
      setCurrentTime(time);
    }
  }, [activeTab]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    const media = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (media) {
      media.volume = newVolume / 100;
    }
  }, [activeTab]);

  const handleMute = useCallback(() => {
    setIsMuted(!isMuted);
    const media = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (media) {
      media.muted = !isMuted;
    }
  }, [activeTab, isMuted]);

  const handleSkip = useCallback((seconds: number) => {
    const media = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (media) {
      const newTime = Math.max(0, Math.min(media.duration, media.currentTime + seconds));
      media.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [activeTab]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    const media = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (media) {
      media.playbackRate = rate;
    }
  }, [activeTab]);

  // 音频可视化
  const initAudioVisualization = () => {
    if (!audioRef.current || audioContext) return;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 检查AudioContext状态
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const source = ctx.createMediaElementSource(audioRef.current);
      const analyzerNode = ctx.createAnalyser();
      
      analyzerNode.fftSize = 128; // 减小FFT大小以提高性能
      analyzerNode.smoothingTimeConstant = 0.8;
      source.connect(analyzerNode);
      analyzerNode.connect(ctx.destination);
      
      setAudioContext(ctx);
      setAnalyser(analyzerNode);
    } catch (error) {
      console.warn('音频可视化初始化失败:', error);
      setShowVisualization(false); // 失败时自动关闭可视化
    }
  };

  const drawVisualization = useCallback(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      analyser.getByteFrequencyData(dataArray);
      
      // 清除画布
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 简化的频谱显示，只显示部分频段
      const displayBars = 32;
      const barWidth = canvas.width / displayBars;
      
      for (let i = 0; i < displayBars; i++) {
        const dataIndex = Math.floor(i * bufferLength / displayBars);
        const barHeight = (dataArray[dataIndex] / 255) * canvas.height * 0.8;
        
        // 使用渐变色
        const hue = (i / displayBars) * 240; // 蓝色到紫色
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
      }
    } catch (error) {
      console.warn('可视化渲染错误:', error);
    }
  }, [analyser]);

  useEffect(() => {
    const animate = () => {
      if (showVisualization && isPlaying && analyser) {
        drawVisualization();
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (showVisualization && isPlaying && analyser) {
      animate();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showVisualization, isPlaying, analyser, drawVisualization]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files, activeTab as 'audio' | 'video');
    }
  };

  const currentAudioFile = audioFiles[currentAudioIndex];
  const currentVideoFile = videoFiles[currentVideoIndex];

  // 简化的键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 只在非输入元素时响应
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // 只支持空格键播放/暂停
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause]);

  const removeFile = (index: number, type: 'audio' | 'video') => {
    if (type === 'audio') {
      const fileToRemove = audioFiles[index];
      URL.revokeObjectURL(fileToRemove.url);
      setAudioFiles(prev => prev.filter((_, i) => i !== index));
      if (currentAudioIndex >= audioFiles.length - 1) {
        setCurrentAudioIndex(Math.max(0, audioFiles.length - 2));
      }
    } else {
      const fileToRemove = videoFiles[index];
      URL.revokeObjectURL(fileToRemove.url);
      setVideoFiles(prev => prev.filter((_, i) => i !== index));
      if (currentVideoIndex >= videoFiles.length - 1) {
        setCurrentVideoIndex(Math.max(0, videoFiles.length - 2));
      }
    }
  };

  return (
    <ToolLayout
      title="媒体工具"
      description="音视频播放器和媒体信息查看器"
    >
      <div className="space-y-6">
        {/* 标签页导航 */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 音频播放器 */}
        {activeTab === 'audio' && (
          <div className="space-y-6">
            {/* 文件上传区域 */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Music className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  拖拽音频文件到此处
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  或点击选择文件
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Upload className="inline-block w-4 h-4 mr-2" />
                选择音频文件
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'audio')}
              />
            </div>

            {/* 错误信息显示 */}
            {uploadError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <div className="flex items-center">
                  <X className="text-red-500 mr-2" size={16} />
                  <span className="text-red-700 dark:text-red-300 text-sm">{uploadError}</span>
                  <button
                    onClick={() => setUploadError('')}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* 音频播放控制 */}
            {currentAudioFile && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {currentAudioFile.name}
                  </h3>
                  <button
                    onClick={() => setShowVisualization(!showVisualization)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <Eye size={16} />
                  </button>
                </div>

                {/* 音频可视化 */}
                {showVisualization && (
                  <div className="mb-4">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      className="w-full h-32 bg-black rounded"
                    />
                  </div>
                )}

                <audio
                  ref={audioRef}
                  src={currentAudioFile.url}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={() => {
                    if (audioRef.current) {
                      setDuration(audioRef.current.duration);
                      setCurrentTime(0);
                    }
                    if (!audioContext && showVisualization) {
                      initAudioVisualization();
                    }
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* 进度条 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>

                {/* 播放控制按钮 */}
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <button
                    onClick={() => handleSkip(-10)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <SkipBack size={20} />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <button
                    onClick={() => handleSkip(10)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <SkipForward size={20} />
                  </button>
                </div>

                {/* 音量和播放速度控制 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button onClick={handleMute} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-500 w-8">{volume}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">速度:</span>
                    <select
                      value={playbackRate}
                      onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                      className="text-sm border border-gray-300 rounded px-2 py-1 dark:border-gray-600 dark:bg-gray-700"
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
            )}

            {/* 音频文件列表 */}
            {audioFiles.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  音频文件列表 ({audioFiles.length})
                </h3>
                <div className="space-y-2">
                  {audioFiles.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded cursor-pointer transition-colors ${
                        index === currentAudioIndex
                          ? 'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setCurrentAudioIndex(index)}
                    >
                      <div className="flex items-center space-x-3">
                        <FileAudio className="text-blue-500" size={16} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {file.size} • {file.duration ? formatTime(file.duration) : 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index, 'audio');
                        }}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 视频播放器 */}
        {activeTab === 'video' && (
          <div className="space-y-6">
            {/* 文件上传区域 */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Video className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  拖拽视频文件到此处
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  或点击选择文件
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Upload className="inline-block w-4 h-4 mr-2" />
                选择视频文件
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="video/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'video')}
              />
            </div>

            {/* 错误信息显示 */}
            {uploadError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <div className="flex items-center">
                  <X className="text-red-500 mr-2" size={16} />
                  <span className="text-red-700 dark:text-red-300 text-sm">{uploadError}</span>
                  <button
                    onClick={() => setUploadError('')}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* 视频播放器 */}
            {currentVideoFile && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {currentVideoFile.name}
                  </h3>
                </div>

                <video
                  ref={videoRef}
                  src={currentVideoFile.url}
                  controls
                  className="w-full max-h-96 rounded"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      setDuration(videoRef.current.duration);
                      setCurrentTime(0);
                    }
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* 视频信息 */}
                {currentVideoFile.metadata && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">分辨率:</span>
                      <p className="font-medium">
                        {currentVideoFile.metadata.width}x{currentVideoFile.metadata.height}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">时长:</span>
                      <p className="font-medium">
                        {formatTime(currentVideoFile.metadata.duration || 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">音频:</span>
                      <p className="font-medium">
                        {currentVideoFile.metadata.hasAudio ? '有' : '无'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">文件大小:</span>
                      <p className="font-medium">{currentVideoFile.size}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 视频文件列表 */}
            {videoFiles.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  视频文件列表 ({videoFiles.length})
                </h3>
                <div className="space-y-2">
                  {videoFiles.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded cursor-pointer transition-colors ${
                        index === currentVideoIndex
                          ? 'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setCurrentVideoIndex(index)}
                    >
                      <div className="flex items-center space-x-3">
                        <FileVideo className="text-green-500" size={16} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {file.size} • {file.duration ? formatTime(file.duration) : 'Unknown'}
                            {file.metadata && (
                              <> • {file.metadata.width}x{file.metadata.height}</>
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index, 'video');
                        }}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 媒体信息查看器 */}
        {activeTab === 'metadata' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                媒体文件信息查看器
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                在音频或视频标签页中选择文件后，可以在这里查看详细的媒体信息。
              </p>

                             {/* 显示当前选中文件的详细信息 */}
               {(currentAudioFile || currentVideoFile) && (
                 <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                   {currentAudioFile && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                        音频文件信息
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">文件名:</span>
                          <p className="font-medium break-all">{currentAudioFile.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">文件类型:</span>
                          <p className="font-medium">{currentAudioFile.type}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">文件大小:</span>
                          <p className="font-medium">{currentAudioFile.size}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">时长:</span>
                          <p className="font-medium">
                            {currentAudioFile.duration ? formatTime(currentAudioFile.duration) : '未知'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">修改时间:</span>
                          <p className="font-medium">{currentAudioFile.lastModified}</p>
                        </div>
                        {currentAudioFile.metadata?.sampleRate && (
                          <div>
                            <span className="text-gray-500">采样率:</span>
                            <p className="font-medium">{currentAudioFile.metadata.sampleRate} Hz</p>
                          </div>
                        )}
                        {currentAudioFile.metadata?.channels && (
                          <div>
                            <span className="text-gray-500">声道数:</span>
                            <p className="font-medium">{currentAudioFile.metadata.channels}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                                     {currentVideoFile && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                        视频文件信息
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">文件名:</span>
                          <p className="font-medium break-all">{currentVideoFile.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">文件类型:</span>
                          <p className="font-medium">{currentVideoFile.type}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">文件大小:</span>
                          <p className="font-medium">{currentVideoFile.size}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">时长:</span>
                          <p className="font-medium">
                            {currentVideoFile.duration ? formatTime(currentVideoFile.duration) : '未知'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">修改时间:</span>
                          <p className="font-medium">{currentVideoFile.lastModified}</p>
                        </div>
                        {currentVideoFile.metadata && (
                          <>
                            <div>
                              <span className="text-gray-500">分辨率:</span>
                              <p className="font-medium">
                                {currentVideoFile.metadata.width}x{currentVideoFile.metadata.height}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">宽高比:</span>
                              <p className="font-medium">
                                {currentVideoFile.metadata.aspectRatio || '未知'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">包含音频:</span>
                              <p className="font-medium">
                                {currentVideoFile.metadata.hasAudio ? '是' : '否'}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 支持的格式信息 */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  支持的媒体格式
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">音频格式</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• MP3 (.mp3)</li>
                      <li>• WAV (.wav)</li>
                      <li>• OGG (.ogg)</li>
                      <li>• FLAC (.flac)</li>
                      <li>• AAC (.aac)</li>
                      <li>• M4A (.m4a)</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">视频格式</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• MP4 (.mp4)</li>
                      <li>• WebM (.webm)</li>
                      <li>• OGV (.ogv)</li>
                      <li>• AVI (.avi)</li>
                      <li>• MOV (.mov)</li>
                      <li>• WMV (.wmv)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            使用说明
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• 支持拖拽上传多个媒体文件（单个文件不超过100MB）</li>
            <li>• 音频播放器包含可视化效果和完整播放控制</li>
            <li>• 视频播放器使用浏览器原生控件，功能稳定可靠</li>
            <li>• 媒体信息标签页显示详细的文件元数据</li>
            <li>• 所有操作均在本地进行，保护您的隐私</li>
            <li>• 键盘快捷键：空格键播放/暂停</li>
            <li>• 自动检测并提示不支持的文件格式</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
} 