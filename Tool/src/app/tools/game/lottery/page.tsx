'use client';

import { useMemo, useRef, useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import {
  Gift,
  Users,
  Hash,
  Settings,
  Download,
  Upload,
  Clipboard,
  CheckCircle2,
  RotateCcw,
  Plus,
  Minus,
  Shuffle,
  Eraser,
} from 'lucide-react';

type Rng = () => number;

function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function mulberry32(a: number): Rng {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createSeededRng(seedText: string): Rng {
  const seed = xmur3(seedText)();
  return mulberry32(seed);
}

interface WeightedItem {
  key: string; // display value
  weight: number;
}

interface DrawRecord {
  id: string;
  timestamp: number;
  mode: 'names' | 'numbers';
  summary: string;
  winners: string[];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function pickWeighted(items: WeightedItem[], rng: Rng): WeightedItem | null {
  const total = items.reduce((s, it) => s + Math.max(0, it.weight), 0);
  if (total <= 0 || items.length === 0) return null;
  let r = rng() * total;
  for (const it of items) {
    r -= Math.max(0, it.weight);
    if (r <= 0) return it;
  }
  return items[items.length - 1] || null;
}

function pickKWinners(
  items: WeightedItem[],
  k: number,
  unique: boolean,
  rng: Rng
): string[] {
  const winners: string[] = [];
  const pool: WeightedItem[] = items
    .filter((i) => i.weight > 0)
    .map((i) => ({ ...i }));

  for (let i = 0; i < k; i++) {
    if (pool.length === 0) break;
    const chosen = pickWeighted(pool, rng);
    if (!chosen) break;
    winners.push(chosen.key);
    if (unique) {
      const idx = pool.findIndex((p) => p.key === chosen.key);
      if (idx >= 0) pool.splice(idx, 1);
    }
  }
  return winners;
}

export default function LotteryPage() {
  const [activeTab, setActiveTab] = useState<'names' | 'numbers'>('names');

  // Names mode
  const [entriesText, setEntriesText] = useState<string>('张三\n李四\n王五\n赵六\n钱七\n孙八');
  const [weightByOccurrences, setWeightByOccurrences] = useState<boolean>(true);
  const [deduplicateSameName, setDeduplicateSameName] = useState<boolean>(false);

  // Numbers mode
  const [minNumber, setMinNumber] = useState<number>(1);
  const [maxNumber, setMaxNumber] = useState<number>(100);

  // Common settings
  const [winnersCount, setWinnersCount] = useState<number>(1);
  const [noRepeatWinners, setNoRepeatWinners] = useState<boolean>(true);
  const [useSeed, setUseSeed] = useState<boolean>(false);
  const [seedText, setSeedText] = useState<string>('');

  const [currentWinners, setCurrentWinners] = useState<string[]>([]);
  const [history, setHistory] = useState<DrawRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rng: Rng = useMemo(() => {
    return useSeed && seedText.trim().length > 0
      ? createSeededRng(seedText.trim())
      : Math.random;
  }, [useSeed, seedText]);

  // Parse names into weighted items
  const nameItems: WeightedItem[] = useMemo(() => {
    const lines = entriesText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsed: { [key: string]: number } = {};

    for (const line of lines) {
      // Support: "姓名", "姓名,3", "姓名*3"
      let name = line;
      let weight = 1;
      const starMatch = line.match(/^(.*?)[\*x×]\s*(\d+)$/);
      const commaMatch = line.match(/^(.*?),(\d+)$/);

      if (starMatch) {
        name = starMatch[1].trim();
        weight = parseInt(starMatch[2], 10) || 1;
      } else if (commaMatch) {
        name = commaMatch[1].trim();
        weight = parseInt(commaMatch[2], 10) || 1;
      }

      if (deduplicateSameName) {
        // When deduplicating, every name counts as weight 1 (unless explicit weight specified)
        parsed[name] = (parsed[name] || 0) + (starMatch || commaMatch ? weight : 1);
      } else if (weightByOccurrences) {
        // Occurrence acts as weight multiplier
        parsed[name] = (parsed[name] || 0) + weight;
      } else {
        // Each occurrence weight = 1, but duplicates allowed
        parsed[name] = (parsed[name] || 0) + 1;
      }
    }

    return Object.entries(parsed).map(([key, weight]) => ({ key, weight: Math.max(1, weight) }));
  }, [entriesText, weightByOccurrences, deduplicateSameName]);

  // Numbers mode items
  const numberItems: WeightedItem[] = useMemo(() => {
    const lo = Math.floor(minNumber);
    const hi = Math.floor(maxNumber);
    const start = Math.min(lo, hi);
    const end = Math.max(lo, hi);
    const items: WeightedItem[] = [];
    for (let n = start; n <= end; n++) items.push({ key: String(n), weight: 1 });
    return items;
  }, [minNumber, maxNumber]);

  const currentPool = activeTab === 'names' ? nameItems : numberItems;
  const effectiveMaxWinners = useMemo(() => {
    return noRepeatWinners ? Math.max(1, currentPool.length) : 9999;
  }, [noRepeatWinners, currentPool.length]);

  const canDraw = currentPool.length > 0 && winnersCount > 0;

  const handleDraw = () => {
    if (!canDraw) return;

    const k = noRepeatWinners
      ? clamp(winnersCount, 1, currentPool.length)
      : clamp(winnersCount, 1, 1000);

    const winners = pickKWinners(currentPool, k, noRepeatWinners, rng);
    setCurrentWinners(winners);

    const record: DrawRecord = {
      id: String(Date.now()),
      timestamp: Date.now(),
      mode: activeTab,
      summary:
        activeTab === 'names'
          ? `名单 ${currentPool.length} 项`
          : `编号 ${minNumber}-${maxNumber}`,
      winners,
    };
    setHistory((prev) => [record, ...prev].slice(0, 20));
  };

  const handleClearResults = () => {
    setCurrentWinners([]);
  };

  const handleClearAll = () => {
    setCurrentWinners([]);
    setHistory([]);
  };

  const handleCopy = async () => {
    const text = currentWinners.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      // noop UI toast; keep minimal
    } catch {}
  };

  const handleExport = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      settings: {
        mode: activeTab,
        winnersCount,
        noRepeatWinners,
        useSeed,
        seedText,
        range: { minNumber, maxNumber },
        weightByOccurrences,
        deduplicateSameName,
      },
      currentWinners,
      history,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lottery-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(String(e.target?.result || '{}'));
        if (json && Array.isArray(json.history)) {
          setHistory(json.history);
        }
        if (Array.isArray(json.currentWinners)) {
          setCurrentWinners(json.currentWinners.map(String));
        }
      } catch {}
    };
    reader.readAsText(file);
    event.currentTarget.value = '';
  };

  return (
    <ToolLayout title="抽奖工具" description="公平的抽奖工具，支持名单与编号两种抽奖模式，支持权重与种子，结果可复现。">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('names')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              activeTab === 'names'
                ? 'bg-blue-600 text-white border-blue-600 shadow'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="h-4 w-4" /> 名单抽取
          </button>
          <button
            onClick={() => setActiveTab('numbers')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              activeTab === 'numbers'
                ? 'bg-blue-600 text-white border-blue-600 shadow'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
            }`}
          >
            <Hash className="h-4 w-4" /> 编号抽取
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" /> 导出
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
            >
              <Upload className="h-4 w-4" /> 导入
              <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: inputs */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'names' && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">名单</h2>
                </div>
                <textarea
                  value={entriesText}
                  onChange={(e) => setEntriesText(e.target.value)}
                  rows={10}
                  placeholder={
                    '每行一个姓名，可使用 "," 或 "*" 指定权重，如：\n张三\n李四,2\n王五*3'
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  共 {nameItems.length} 个唯一姓名。
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={weightByOccurrences}
                      onChange={(e) => setWeightByOccurrences(e.target.checked)}
                    />
                    按出现次数加权
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={deduplicateSameName}
                      onChange={(e) => setDeduplicateSameName(e.target.checked)}
                    />
                    去重相同姓名
                  </label>
                  <button
                    onClick={() => setEntriesText('')}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  >
                    <Eraser className="h-4 w-4" /> 清空名单
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'numbers' && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">编号范围</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">最小值</label>
                    <input
                      type="number"
                      value={minNumber}
                      onChange={(e) => setMinNumber(parseInt(e.target.value || '0', 10))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">最大值</label>
                    <input
                      type="number"
                      value={maxNumber}
                      onChange={(e) => setMaxNumber(parseInt(e.target.value || '0', 10))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      共 {numberItems.length} 个编号
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: settings and actions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">抽奖设置</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">抽取人数</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWinnersCount((v) => clamp(v - 1, 1, 999))}
                      className="p-2 rounded-lg border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={winnersCount}
                      onChange={(e) => setWinnersCount(clamp(parseInt(e.target.value || '1', 10), 1, 999))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2 text-center"
                    />
                    <button
                      onClick={() => setWinnersCount((v) => clamp(v + 1, 1, 999))}
                      className="p-2 rounded-lg border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {noRepeatWinners && activeTab === 'names' && (
                    <div className="mt-1 text-xs text-gray-500">最多 {currentPool.length} 人（不重复）</div>
                  )}
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={noRepeatWinners}
                    onChange={(e) => setNoRepeatWinners(e.target.checked)}
                  />
                  不允许重复中奖
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={useSeed}
                    onChange={(e) => setUseSeed(e.target.checked)}
                  />
                  使用自定义种子（可复现）
                </label>
                {useSeed && (
                  <input
                    type="text"
                    value={seedText}
                    onChange={(e) => setSeedText(e.target.value)}
                    placeholder="例如：活动2025-01-01"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2"
                  />
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handleDraw}
                    disabled={!canDraw}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
                      canDraw ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Shuffle className="h-4 w-4" /> 开始抽奖
                  </button>
                  <button
                    onClick={handleClearResults}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                  >
                    <RotateCcw className="h-4 w-4" /> 清空结果
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={currentWinners.length === 0}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      currentWinners.length > 0
                        ? 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                    }`}
                  >
                    <Clipboard className="h-4 w-4" /> 复制结果
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">本次结果</h3>
              </div>
              {currentWinners.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-sm">暂无结果，点击“开始抽奖”生成。</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {currentWinners.map((w, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">历史记录</h3>
          {history.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-sm">暂无历史记录。</p>
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <div className="font-medium">
                      {new Date(h.timestamp).toLocaleString()} · {h.mode === 'names' ? '名单' : '编号'} · {h.summary}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {h.winners.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          提示：为保证公平性，可在抽奖前设置“自定义种子”（如活动名称+日期），并在结果导出文件中保存设置以便复核。
        </div>
      </div>
    </ToolLayout>
  );
}