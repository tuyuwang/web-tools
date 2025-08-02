'use client';

import { useState, useEffect } from 'react';
import { Copy, RotateCcw, Clock, Calendar } from 'lucide-react';

interface TimeFormat {
  name: string;
  value: string;
  description: string;
}

export default function TimestampConverterPage() {
  const [timestamp, setTimestamp] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [timeFormats, setTimeFormats] = useState<TimeFormat[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 时间戳转日期时间
  const timestampToDateTime = (ts: string) => {
    const num = parseInt(ts);
    if (isNaN(num)) return '';
    
    // 判断是秒还是毫秒
    const date = num < 10000000000 ? new Date(num * 1000) : new Date(num);
    return date.toISOString();
  };

  // 日期时间转时间戳
  const dateTimeToTimestamp = (dt: string) => {
    const date = new Date(dt);
    if (isNaN(date.getTime())) return '';
    return Math.floor(date.getTime() / 1000).toString();
  };

  // 生成时间格式
  const generateTimeFormats = (inputTimestamp: string, inputDateTime: string) => {
    const formats: TimeFormat[] = [];
    
    if (inputTimestamp) {
      const num = parseInt(inputTimestamp);
      if (!isNaN(num)) {
        const date = num < 10000000000 ? new Date(num * 1000) : new Date(num);
        
        formats.push(
          {
            name: 'ISO 8601',
            value: date.toISOString(),
            description: '标准ISO格式'
          },
          {
            name: '本地时间',
            value: date.toLocaleString('zh-CN'),
            description: '本地化时间格式'
          },
          {
            name: 'UTC时间',
            value: date.toUTCString(),
            description: 'UTC时间格式'
          },
          {
            name: '日期',
            value: date.toLocaleDateString('zh-CN'),
            description: '仅日期部分'
          },
          {
            name: '时间',
            value: date.toLocaleTimeString('zh-CN'),
            description: '仅时间部分'
          },
          {
            name: '毫秒时间戳',
            value: date.getTime().toString(),
            description: '毫秒级时间戳'
          }
        );
      }
    } else if (inputDateTime) {
      const date = new Date(inputDateTime);
      if (!isNaN(date.getTime())) {
        formats.push(
          {
            name: '秒时间戳',
            value: Math.floor(date.getTime() / 1000).toString(),
            description: '秒级时间戳'
          },
          {
            name: '毫秒时间戳',
            value: date.getTime().toString(),
            description: '毫秒级时间戳'
          },
          {
            name: 'ISO 8601',
            value: date.toISOString(),
            description: '标准ISO格式'
          },
          {
            name: '本地时间',
            value: date.toLocaleString('zh-CN'),
            description: '本地化时间格式'
          },
          {
            name: 'UTC时间',
            value: date.toUTCString(),
            description: 'UTC时间格式'
          }
        );
      }
    }
    
    setTimeFormats(formats);
  };

  // 处理时间戳输入
  const handleTimestampChange = (value: string) => {
    setTimestamp(value);
    if (value.trim()) {
      const dateTimeValue = timestampToDateTime(value);
      setDateTime(dateTimeValue);
      generateTimeFormats(value, '');
    } else {
      setDateTime('');
      setTimeFormats([]);
    }
  };

  // 处理日期时间输入
  const handleDateTimeChange = (value: string) => {
    setDateTime(value);
    if (value.trim()) {
      const timestampValue = dateTimeToTimestamp(value);
      setTimestamp(timestampValue);
      generateTimeFormats('', value);
    } else {
      setTimestamp('');
      setTimeFormats([]);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  };

  // 清空所有
  const clearAll = () => {
    setTimestamp('');
    setDateTime('');
    setTimeFormats([]);
  };

  // 使用当前时间
  const useCurrentTime = () => {
    const now = new Date();
    const timestampValue = Math.floor(now.getTime() / 1000).toString();
    setTimestamp(timestampValue);
    setDateTime(now.toISOString());
    generateTimeFormats(timestampValue, '');
  };

  // 预设时间戳
  const presetTimestamps = [
    { name: '当前时间', value: Math.floor(currentTime.getTime() / 1000).toString() },
    { name: 'Unix纪元', value: '0' },
    { name: '2024年1月1日', value: '1704067200' },
    { name: '2023年1月1日', value: '1672531200' },
    { name: '2020年1月1日', value: '1577836800' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          时间戳转换工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          时间戳与日期时间相互转换，支持多种格式
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              时间转换
            </h2>

            <div className="space-y-4">
              {/* 时间戳输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  时间戳
                </label>
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => handleTimestampChange(e.target.value)}
                  placeholder="输入时间戳（秒或毫秒）"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  支持秒级和毫秒级时间戳
                </p>
              </div>

              {/* 日期时间输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  日期时间
                </label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => handleDateTimeChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={useCurrentTime}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  使用当前时间
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  清空
                </button>
              </div>
            </div>
          </div>

          {/* 预设时间戳 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              预设时间戳
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {presetTimestamps.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleTimestampChange(preset.value)}
                  className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {preset.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {preset.value}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 转换结果 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              转换结果
            </h2>
            
            {timeFormats.length > 0 ? (
              <div className="space-y-4">
                {timeFormats.map((format, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {format.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format.description}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(format.value)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        复制
                      </button>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <code className="text-sm font-mono text-gray-900 dark:text-white break-all">
                        {format.value}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>输入时间戳或日期时间开始转换</p>
              </div>
            )}
          </div>

          {/* 当前时间显示 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              当前时间
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">本地时间:</span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">
                  {currentTime.toLocaleString('zh-CN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">UTC时间:</span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">
                  {currentTime.toUTCString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">秒时间戳:</span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">
                  {Math.floor(currentTime.getTime() / 1000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">毫秒时间戳:</span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">
                  {currentTime.getTime()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 