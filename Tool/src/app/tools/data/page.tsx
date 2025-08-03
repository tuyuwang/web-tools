'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Database, FileSpreadsheet, Filter, Download, Upload, Activity, Target } from 'lucide-react';

export default function DataToolsPage() {
  const [activeTab, setActiveTab] = useState('analyze');
  const [inputData, setInputData] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartType, setChartType] = useState('bar');

  const tabs = [
    { id: 'analyze', name: '数据分析', icon: BarChart3 },
    { id: 'visualize', name: '数据可视化', icon: PieChart },
    { id: 'transform', name: '数据转换', icon: FileSpreadsheet },
    { id: 'statistics', name: '统计分析', icon: TrendingUp },
  ];

  const analyzeData = (data: string) => {
    try {
      const lines = data.trim().split('\n');
      const numbers = lines.map(line => {
        const num = parseFloat(line.trim());
        return isNaN(num) ? 0 : num;
      }).filter(num => num !== 0);

      if (numbers.length === 0) {
        setAnalysisResult('没有找到有效的数值数据');
        return;
      }

      const sum = numbers.reduce((a, b) => a + b, 0);
      const mean = sum / numbers.length;
      const sorted = [...numbers].sort((a, b) => a - b);
      const median = sorted.length % 2 === 0 
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
      
      const variance = numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.length;
      const stdDev = Math.sqrt(variance);
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);

      const result = `
数据分析结果:
- 数据点数量: ${numbers.length}
- 总和: ${sum.toFixed(2)}
- 平均值: ${mean.toFixed(2)}
- 中位数: ${median.toFixed(2)}
- 最小值: ${min.toFixed(2)}
- 最大值: ${max.toFixed(2)}
- 标准差: ${stdDev.toFixed(2)}
- 方差: ${variance.toFixed(2)}
      `.trim();

      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult('数据分析失败，请检查数据格式');
    }
  };

  const generateChartData = (data: string) => {
    try {
      const lines = data.trim().split('\n');
      const chartData = lines.map((line, index) => {
        const [label, value] = line.split(',').map(item => item.trim());
        return {
          id: index,
          label: label || `项目${index + 1}`,
          value: parseFloat(value) || 0,
        };
      }).filter(item => item.value > 0);

      setChartData(chartData);
    } catch (error) {
      setChartData([]);
    }
  };

  const transformData = (data: string, type: string) => {
    try {
      let result = '';
      const lines = data.trim().split('\n');
      
      switch (type) {
        case 'sort':
          result = lines.sort().join('\n');
          break;
        case 'reverse':
          result = lines.reverse().join('\n');
          break;
        case 'unique':
          result = Array.from(new Set(lines)).join('\n');
          break;
        case 'count':
          const counts: { [key: string]: number } = {};
          lines.forEach(line => {
            counts[line] = (counts[line] || 0) + 1;
          });
          result = Object.entries(counts)
            .map(([item, count]) => `${item}: ${count}`)
            .join('\n');
          break;
        case 'uppercase':
          result = lines.map(line => line.toUpperCase()).join('\n');
          break;
        case 'lowercase':
          result = lines.map(line => line.toLowerCase()).join('\n');
          break;
      }
      
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult('数据转换失败');
    }
  };

  const calculateStatistics = (data: string) => {
    try {
      const lines = data.trim().split('\n');
      const numbers = lines.map(line => {
        const num = parseFloat(line.trim());
        return isNaN(num) ? 0 : num;
      }).filter(num => num !== 0);

      if (numbers.length === 0) {
        setAnalysisResult('没有找到有效的数值数据');
        return;
      }

      const sum = numbers.reduce((a, b) => a + b, 0);
      const mean = sum / numbers.length;
      const sorted = [...numbers].sort((a, b) => a - b);
      
      // 四分位数
      const q1Index = Math.floor(numbers.length * 0.25);
      const q3Index = Math.floor(numbers.length * 0.75);
      const q1 = sorted[q1Index];
      const q3 = sorted[q3Index];
      const iqr = q3 - q1;

      // 异常值检测
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      const outliers = numbers.filter(num => num < lowerBound || num > upperBound);

      const result = `
统计分析结果:
基础统计:
- 样本数量: ${numbers.length}
- 总和: ${sum.toFixed(2)}
- 平均值: ${mean.toFixed(2)}
- 最小值: ${Math.min(...numbers).toFixed(2)}
- 最大值: ${Math.max(...numbers).toFixed(2)}

分布统计:
- 第一四分位数 (Q1): ${q1.toFixed(2)}
- 第三四分位数 (Q3): ${q3.toFixed(2)}
- 四分位距 (IQR): ${iqr.toFixed(2)}
- 异常值数量: ${outliers.length}
- 异常值: ${outliers.length > 0 ? outliers.map(v => v.toFixed(2)).join(', ') : '无'}

数据质量:
- 数据完整性: ${((numbers.length / lines.length) * 100).toFixed(1)}%
- 数据范围: ${(Math.max(...numbers) - Math.min(...numbers)).toFixed(2)}
      `.trim();

      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult('统计分析失败，请检查数据格式');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          数据工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          数据分析、可视化和统计工具
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

      {/* 数据分析 */}
      {activeTab === 'analyze' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                输入数据
              </h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  数值数据（每行一个数字）
                </label>
                <textarea
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  placeholder="输入数值数据，每行一个数字...&#10;例如:&#10;10&#10;20&#10;30&#10;40&#10;50"
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <button
                onClick={() => analyzeData(inputData)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>分析数据</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  分析结果
                </h3>
                {analysisResult && (
                  <button
                    onClick={() => copyToClipboard(analysisResult)}
                    className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    <Download className="h-4 w-4" />
                    <span>复制</span>
                  </button>
                )}
              </div>
              <textarea
                value={analysisResult}
                readOnly
                placeholder="分析结果将显示在这里..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white font-mono text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* 数据可视化 */}
      {activeTab === 'visualize' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              图表生成器
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  数据格式：标签,数值（每行一组）
                </label>
                <textarea
                  value={inputData}
                  onChange={(e) => {
                    setInputData(e.target.value);
                    generateChartData(e.target.value);
                  }}
                  placeholder="标签,数值&#10;项目A,100&#10;项目B,200&#10;项目C,150"
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  图表类型:
                </label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="bar">柱状图</option>
                  <option value="pie">饼图</option>
                  <option value="line">折线图</option>
                </select>
              </div>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                图表预览
              </h3>
              
              <div className="space-y-4">
                {chartType === 'bar' && (
                  <div className="space-y-2">
                    {chartData.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <span className="w-20 text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                          <div
                            className="bg-primary-600 h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs"
                            style={{ width: `${(item.value / Math.max(...chartData.map(d => d.value))) * 100}%` }}
                          >
                            {item.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {chartType === 'pie' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-center">
                      <div className="w-48 h-48 rounded-full border-8 border-gray-200 dark:border-gray-700 relative">
                        {chartData.map((item, index) => {
                          const total = chartData.reduce((sum, d) => sum + d.value, 0);
                          const percentage = (item.value / total) * 100;
                          const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
                          return (
                            <div
                              key={item.id}
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: `conic-gradient(${colors[index % colors.length]} 0deg ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg)`,
                                transform: `rotate(${chartData.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0)}deg)`,
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {chartData.map((item, index) => {
                        const total = chartData.reduce((sum, d) => sum + d.value, 0);
                        const percentage = ((item.value / total) * 100).toFixed(1);
                        const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
                        return (
                          <div key={item.id} className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 数据转换 */}
      {activeTab === 'transform' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                输入数据
              </h3>
              <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="输入要转换的数据，每行一个项目..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  转换结果
                </h3>
                {analysisResult && (
                  <button
                    onClick={() => copyToClipboard(analysisResult)}
                    className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    <Download className="h-4 w-4" />
                    <span>复制</span>
                  </button>
                )}
              </div>
              <textarea
                value={analysisResult}
                readOnly
                placeholder="转换结果将显示在这里..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: '排序', action: 'sort', icon: TrendingUp },
              { name: '反转', action: 'reverse', icon: TrendingUp },
              { name: '去重', action: 'unique', icon: Filter },
              { name: '计数', action: 'count', icon: BarChart3 },
              { name: '转大写', action: 'uppercase', icon: FileSpreadsheet },
              { name: '转小写', action: 'lowercase', icon: FileSpreadsheet },
            ].map((tool) => (
              <button
                key={tool.action}
                onClick={() => transformData(inputData, tool.action)}
                className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
              >
                <tool.icon className="h-6 w-6 text-primary-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {tool.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 统计分析 */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                输入数据
              </h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  数值数据（每行一个数字）
                </label>
                <textarea
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  placeholder="输入数值数据，每行一个数字...&#10;例如:&#10;10&#10;20&#10;30&#10;40&#10;50"
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <button
                onClick={() => calculateStatistics(inputData)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Activity className="h-4 w-4" />
                <span>统计分析</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  统计结果
                </h3>
                {analysisResult && (
                  <button
                    onClick={() => copyToClipboard(analysisResult)}
                    className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    <Download className="h-4 w-4" />
                    <span>复制</span>
                  </button>
                )}
              </div>
              <textarea
                value={analysisResult}
                readOnly
                placeholder="统计结果将显示在这里..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white font-mono text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
} 