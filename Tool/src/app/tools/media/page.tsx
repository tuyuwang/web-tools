'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Upload, Music, Video, Image, FileAudio, FileVideo, Settings } from 'lucide-react';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

export default function MediaToolsPage() {
  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('media');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('media');
  
  const [activeTab, setActiveTab] = useState('audio');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const tabs = [
    { id: 'audio', name: pageTranslation.tabs.audio, icon: Music },
    { id: 'video', name: pageTranslation.tabs.video, icon: Video },
    { id: 'converter', name: pageTranslation.tabs.converter, icon: FileAudio },
  ];

  const handleFileUpload = (file: File, type: 'audio' | 'video') => {
    if (type === 'audio') {
      setAudioFile(file);
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(file);
      }
    } else {
      setVideoFile(file);
      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(file);
      }
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {ui.placeholders.chooseFile}
                  </p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'audio');
                    }}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* 音频播放器 */}
              {audioFile && (
                <div className="space-y-4">
                  <audio
                    ref={audioRef}
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full"
                    controls
                  />
                  
                  {/* 控制按钮 */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePlayPause}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isPlaying ? pageTranslation.controls.pause : pageTranslation.controls.play}</span>
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-gray-500" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        className="w-20"
                      />
                    </div>
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
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {ui.placeholders.chooseFile}
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'video');
                    }}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* 视频播放器 */}
              {videoFile && (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    className="w-full rounded-lg"
                    controls
                  />
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
              
              <div className="text-center py-8">
                <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {ui.messages.processing}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
          {pageTranslation.instructions}
        </h3>
        <ul className="space-y-2 text-blue-700 dark:text-blue-300">
          {pageTranslation.instructionSteps.map((step: string, index: number) => (
            <li key={index}>• {step}</li>
          ))}
        </ul>
      </div>
    </ToolLayout>
  );
} 