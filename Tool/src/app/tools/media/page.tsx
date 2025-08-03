'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Upload, Music, Video, Image, FileAudio, FileVideo, Settings } from 'lucide-react';

export default function MediaToolsPage() {
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
    { id: 'audio', name: '音频工具', icon: Music },
    { id: 'video', name: '视频工具', icon: Video },
    { id: 'converter', name: '格式转换', icon: FileAudio },
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
    { name: 'MP3', description: '最常用的音频格式，兼容性好' },
    { name: 'WAV', description: '无损音频格式，文件较大' },
    { name: 'AAC', description: '苹果设备常用格式' },
    { name: 'OGG', description: '开源音频格式' },
    { name: 'FLAC', description: '无损压缩格式' },
  ];

  const videoFormats = [
    { name: 'MP4', description: '最常用的视频格式' },
    { name: 'AVI', description: '传统视频格式' },
    { name: 'MOV', description: '苹果设备常用格式' },
    { name: 'WebM', description: '网页视频格式' },
    { name: 'MKV', description: '开源容器格式' },
  ];

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          媒体工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          音频、视频处理和格式转换工具
        </p>
      </div>

      {/* 标签页 */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* 音频工具 */}
      {activeTab === 'audio' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              音频播放器
            </h3>
            
            {/* 文件上传 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                选择音频文件
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'audio');
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300"
                />
                {audioFile && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {audioFile.name}
                  </span>
                )}
              </div>
            </div>

            {/* 音频播放器 */}
            {audioFile && (
              <div className="space-y-4">
                <audio
                  ref={audioRef}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleTimeUpdate}
                  className="w-full"
                  controls
                />
                
                {/* 自定义控制器 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePlayPause}
                      className="flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <Volume2 className="h-4 w-4 text-gray-500" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                        {volume}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatTime(currentTime)}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 音频信息 */}
          {audioFile && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                音频信息
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">文件名</span>
                  <p className="font-medium">{audioFile.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">文件大小</span>
                  <p className="font-medium">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">文件类型</span>
                  <p className="font-medium">{audioFile.type}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">时长</span>
                  <p className="font-medium">{formatTime(duration)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 视频工具 */}
      {activeTab === 'video' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              视频播放器
            </h3>
            
            {/* 文件上传 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                选择视频文件
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'video');
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300"
                />
                {videoFile && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {videoFile.name}
                  </span>
                )}
              </div>
            </div>

            {/* 视频播放器 */}
            {videoFile && (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  controls
                  className="w-full max-w-2xl mx-auto rounded-lg"
                />
                
                {/* 视频信息 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">文件名</span>
                    <p className="font-medium">{videoFile.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">文件大小</span>
                    <p className="font-medium">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">文件类型</span>
                    <p className="font-medium">{videoFile.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">分辨率</span>
                    <p className="font-medium">-</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 格式转换 */}
      {activeTab === 'converter' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 音频格式 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                音频格式转换
              </h3>
              <div className="space-y-3">
                {audioFormats.map((format) => (
                  <div key={format.name} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{format.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{format.description}</p>
                    </div>
                    <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors">
                      转换
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 视频格式 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                视频格式转换
              </h3>
              <div className="space-y-3">
                {videoFormats.map((format) => (
                  <div key={format.name} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{format.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{format.description}</p>
                    </div>
                    <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors">
                      转换
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 批量转换 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              批量转换
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择文件
                </label>
                <input
                  type="file"
                  multiple
                  accept="audio/*,video/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  目标格式
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                  <option value="">选择格式</option>
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV</option>
                  <option value="aac">AAC</option>
                  <option value="mp4">MP4</option>
                  <option value="avi">AVI</option>
                </select>
              </div>
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                <Settings className="h-4 w-4" />
                <span>开始批量转换</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
} 