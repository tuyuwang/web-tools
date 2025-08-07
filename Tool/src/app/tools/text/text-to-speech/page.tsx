'use client';

import { useState, useEffect } from 'react';
import { Volume2, Play, Pause, Square, Download, Settings, VolumeX } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface Voice {
  name: string;
  lang: string;
  voiceURI: string;
}

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // 检查浏览器支持
    if (!window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    // 加载可用语音
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const voiceList = availableVoices.map(voice => ({
        name: voice.name,
        lang: voice.lang,
        voiceURI: voice.voiceURI,
      }));
      
      setVoices(voiceList);
      
      // 默认选择中文语音
      const chineseVoice = voiceList.find(voice => 
        voice.lang.includes('zh') || voice.name.includes('Chinese')
      );
      if (chineseVoice && !selectedVoice) {
        setSelectedVoice(chineseVoice.voiceURI);
      } else if (voiceList.length > 0 && !selectedVoice) {
        setSelectedVoice(voiceList[0].voiceURI);
      }
    };

    loadVoices();
    
    // 某些浏览器需要异步加载语音
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoice]);

  const speak = () => {
    if (!text.trim()) {
      alert('请输入要朗读的文字');
      return;
    }

    // 停止当前播放
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 设置语音参数
    const voice = voices.find(v => v.voiceURI === selectedVoice);
    if (voice) {
      const speechVoice = window.speechSynthesis.getVoices().find(v => v.voiceURI === voice.voiceURI);
      if (speechVoice) {
        utterance.voice = speechVoice;
      }
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // 事件监听
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };

    setCurrentUtterance(utterance);
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentUtterance(null);
  };

  const downloadAudio = async () => {
    if (!text.trim()) {
      alert('请输入要转换的文字');
      return;
    }

    try {
      // 使用Web Audio API生成音频文件
      // 注意：这是一个简化的实现，实际的音频录制需要更复杂的处理
      alert('音频下载功能需要更高级的API支持。当前版本支持在线播放。');
    } catch (error) {
      console.error('Download error:', error);
      alert('下载功能暂不可用');
    }
  };

  const getLanguageGroups = () => {
    const groups: { [key: string]: Voice[] } = {};
    voices.forEach(voice => {
      const lang = voice.lang.split('-')[0];
      const langName = getLanguageName(lang);
      if (!groups[langName]) {
        groups[langName] = [];
      }
      groups[langName].push(voice);
    });
    return groups;
  };

  const getLanguageName = (lang: string) => {
    const langMap: { [key: string]: string } = {
      'zh': '中文',
      'en': 'English',
      'ja': '日本語',
      'ko': '한국어',
      'es': 'Español',
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano',
      'ru': 'Русский',
      'pt': 'Português',
      'ar': 'العربية',
    };
    return langMap[lang] || lang.toUpperCase();
  };

  if (!isSupported) {
    return (
      <ToolLayout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <VolumeX className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            不支持文字转语音
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            您的浏览器不支持Web Speech API，请使用支持此功能的现代浏览器。
          </p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            文字转语音工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            将文字转换为语音，支持多种语言和声音选择，完全客户端处理
          </p>
        </div>

        {/* 设置面板 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">语音设置</h3>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
          
          {showSettings && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  语音选择
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                >
                  {Object.entries(getLanguageGroups()).map(([langName, voiceList]) => (
                    <optgroup key={langName} label={langName}>
                      {voiceList.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  语速: {rate}x
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  音调: {pitch}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  音量: {Math.round(volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* 文本输入区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                输入要朗读的文字
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="请输入要转换为语音的文字..."
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              />
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                字符数: {text.length}
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex flex-wrap justify-center gap-4">
              {!isPlaying ? (
                <button
                  onClick={speak}
                  disabled={!text.trim()}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4 mr-2" />
                  开始朗读
                </button>
              ) : (
                <div className="flex gap-2">
                  {!isPaused ? (
                    <button
                      onClick={pause}
                      className="btn btn-secondary"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      暂停
                    </button>
                  ) : (
                    <button
                      onClick={resume}
                      className="btn btn-secondary"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      继续
                    </button>
                  )}
                  
                  <button
                    onClick={stop}
                    className="btn btn-outline"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    停止
                  </button>
                </div>
              )}

              <button
                onClick={downloadAudio}
                disabled={!text.trim()}
                className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                下载音频
              </button>
            </div>
          </div>
        </div>

        {/* 播放状态 */}
        {isPlaying && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2">
              <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-200">
                {isPaused ? '已暂停' : '正在播放...'}
              </span>
              {!isPaused && (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 快捷文本示例 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">示例文本</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              '欢迎使用文字转语音工具！这个工具可以将任何文字转换为语音。',
              'Hello! Welcome to our text-to-speech tool. You can convert any text to speech.',
              'こんにちは！テキスト読み上げツールへようこそ。',
              '안녕하세요! 텍스트 음성 변환 도구에 오신 것을 환영합니다.',
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setText(example)}
                className="text-left p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-sm"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">使用说明：</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>• 输入要朗读的文字，支持中文、英文等多种语言</li>
            <li>• 可以选择不同的语音、调整语速、音调和音量</li>
            <li>• 支持播放控制：播放、暂停、停止</li>
            <li>• 使用浏览器内置的语音合成引擎，无需联网</li>
            <li>• 不同浏览器和操作系统提供的语音选项可能不同</li>
            <li>• 音频下载功能需要更高级的API支持，当前版本仅支持在线播放</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}