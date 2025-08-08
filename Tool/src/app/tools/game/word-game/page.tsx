'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { BookOpen, RefreshCcw, HelpCircle, BarChart3, Keyboard } from 'lucide-react';

// 游戏配置
const DEFAULT_WORD_LENGTH = 5;
const MIN_WORD_LENGTH = 4;
const MAX_WORD_LENGTH = 7;
const MAX_ATTEMPTS = 6;

type LetterState = 'correct' | 'present' | 'absent' | undefined;

interface Guess {
  word: string;
  evaluation: LetterState[]; // 每个字母的判定
}

// 简易单词库（可扩展）。所有单词均为小写。
const WORD_LISTS: Record<number, string[]> = {
  4: [
    'game', 'time', 'code', 'word', 'iron', 'milk', 'blue', 'gold', 'rain', 'wind',
    'tree', 'moon', 'star', 'book', 'fish', 'bird', 'home', 'love', 'snow', 'song'
  ],
  5: [
    'apple', 'angle', 'beach', 'brave', 'cloud', 'crane', 'dream', 'eager', 'earth', 'fairy',
    'fruit', 'grape', 'green', 'happy', 'house', 'input', 'joker', 'knife', 'lemon', 'light',
    'money', 'night', 'ocean', 'pilot', 'pizza', 'queen', 'river', 'smile', 'table', 'uncle',
    'value', 'whale', 'xenon', 'young', 'zebra', 'trace', 'sugar', 'plant', 'sound', 'quick'
  ],
  6: [
    'planet', 'orange', 'silver', 'bridge', 'stream', 'little', 'bright', 'nature', 'animal', 'friend',
    'flight', 'golden', 'charge', 'window', 'letter', 'cheese', 'market', 'school', 'summer', 'winter'
  ],
  7: [
    'balance', 'castle', 'journey', 'library', 'orchard', 'picture', 'quantum', 'rainbow', 'sunrise', 'victory',
    'harvest', 'digital', 'science', 'freedom', 'gingham', 'mistake', 'network', 'passion', 'purpose', 'station'
  ],
};

function getTodayIndex(max: number): number {
  const now = new Date();
  // 以 YYYYMMDD 作为种子，生成稳定索引
  const seed = Number(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`);
  // 线性同余生成器简化版
  let x = seed % 2147483647;
  x = (x * 48271) % 2147483647;
  return x % Math.max(1, max);
}

function evaluateGuess(guess: string, target: string): LetterState[] {
  const length = target.length;
  const result: LetterState[] = Array(length).fill(undefined);
  const targetLetterCounts: Record<string, number> = {};

  for (let i = 0; i < length; i++) {
    const ch = target[i];
    targetLetterCounts[ch] = (targetLetterCounts[ch] || 0) + 1;
  }

  // 先标记完全正确（绿色）
  for (let i = 0; i < length; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'correct';
      targetLetterCounts[guess[i]] -= 1;
    }
  }

  // 再标记存在但位置不对（黄色）或不存在（灰色）
  for (let i = 0; i < length; i++) {
    if (result[i]) continue;
    const ch = guess[i];
    if (targetLetterCounts[ch] > 0) {
      result[i] = 'present';
      targetLetterCounts[ch] -= 1;
    } else {
      result[i] = 'absent';
    }
  }

  return result;
}

function getKeyClass(state: LetterState): string {
  switch (state) {
    case 'correct':
      return 'bg-green-600 text-white';
    case 'present':
      return 'bg-yellow-500 text-white';
    case 'absent':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white';
  }
}

export default function WordGamePage() {
  // 配置
  const [wordLength, setWordLength] = useState<number>(DEFAULT_WORD_LENGTH);
  const [mode, setMode] = useState<'random' | 'daily'>('random');

  // 游戏状态
  const [targetWord, setTargetWord] = useState<string>('');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);

  // 键盘状态
  const [keyboardState, setKeyboardState] = useState<Record<string, LetterState>>({});

  // 统计信息（本地存储）
  const [stats, setStats] = useState({
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
  });

  const availableWords = useMemo(() => WORD_LISTS[wordLength] || [], [wordLength]);

  const startNewGame = useCallback(() => {
    const list = availableWords;
    if (list.length === 0) return;

    const index = mode === 'daily' ? getTodayIndex(list.length) : Math.floor(Math.random() * list.length);
    const word = list[index];

    setTargetWord(word);
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setMessage('');
    setKeyboardState({});
  }, [availableWords, mode]);

  // 初始化
  useEffect(() => {
    // 加载统计
    try {
      const saved = localStorage.getItem('word-game-stats');
      if (saved) {
        setStats(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // 改变词长或模式时，重开一局
  useEffect(() => {
    startNewGame();
  }, [wordLength, mode, startNewGame]);

  const saveStats = (updated: typeof stats) => {
    setStats(updated);
    try {
      localStorage.setItem('word-game-stats', JSON.stringify(updated));
    } catch {}
  };

  const updateKeyboardState = (guess: string, evaluation: LetterState[]) => {
    setKeyboardState(prev => {
      const next = { ...prev };
      for (let i = 0; i < guess.length; i++) {
        const key = guess[i].toUpperCase();
        const state = evaluation[i];
        const current = next[key];
        // 状态优先级：correct > present > absent
        const rank = (s?: LetterState) => (s === 'correct' ? 3 : s === 'present' ? 2 : s === 'absent' ? 1 : 0);
        if (rank(state) > rank(current)) {
          next[key] = state;
        }
      }
      return next;
    });
  };

  const submitGuess = () => {
    if (gameStatus !== 'playing') return;

    const guess = currentGuess.toLowerCase();
    if (guess.length !== wordLength) {
      setMessage(`需要 ${wordLength} 个字母`);
      return;
    }

    // 可选：校验是否在单词库中
    if (!availableWords.includes(guess)) {
      setMessage('未收录的单词（可更换词长或继续尝试）');
      return;
    }

    const evaluation = evaluateGuess(guess, targetWord);
    const newGuess: Guess = { word: guess, evaluation };
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);
    updateKeyboardState(guess, evaluation);
    setCurrentGuess('');

    if (guess === targetWord) {
      setGameStatus('won');
      setMessage('🎉 恭喜，猜对了！');
      const updated = {
        played: stats.played + 1,
        wins: stats.wins + 1,
        currentStreak: stats.currentStreak + 1,
        maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
      };
      saveStats(updated);
      return;
    }

    if (newGuesses.length >= MAX_ATTEMPTS) {
      setGameStatus('lost');
      setMessage(`很遗憾，答案是 ${targetWord.toUpperCase()}`);
      const updated = {
        played: stats.played + 1,
        wins: stats.wins,
        currentStreak: 0,
        maxStreak: stats.maxStreak,
      };
      saveStats(updated);
      return;
    }

    setMessage('');
  };

  // 物理键盘输入
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;
      if (e.key === 'Enter') {
        e.preventDefault();
        submitGuess();
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        setCurrentGuess(prev => prev.slice(0, -1));
        return;
      }
      const isLetter = /^[a-zA-Z]$/.test(e.key);
      if (isLetter) {
        e.preventDefault();
        setCurrentGuess(prev => (prev.length < wordLength ? (prev + e.key.toLowerCase()) : prev));
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameStatus, wordLength]);

  const rows = useMemo(() => {
    return Array.from({ length: MAX_ATTEMPTS }, (_, rowIndex) => {
      const guess = guesses[rowIndex];
      const letters = guess ? guess.word.split('') : currentGuess.split('');
      return Array.from({ length: wordLength }, (_, colIndex) => {
        const char = letters[colIndex]?.toUpperCase() || '';
        const state = guess ? guess.evaluation[colIndex] : undefined;
        const base = 'w-12 h-12 md:w-14 md:h-14 border-2 rounded-lg flex items-center justify-center text-lg md:text-xl font-bold select-none';
        const stateClass = state === 'correct'
          ? 'bg-green-600 border-green-700 text-white'
          : state === 'present'
            ? 'bg-yellow-500 border-yellow-600 text-white'
            : state === 'absent'
              ? 'bg-gray-500 border-gray-600 text-white'
              : char
                ? 'border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-600 text-gray-400';
        return (
          <div key={`${rowIndex}-${colIndex}`} className={`${base} ${stateClass}`}>
            {char}
          </div>
        );
      });
    });
  }, [guesses, currentGuess, wordLength]);

  const keyboardRows = [
    'QWERTYUIOP'.split(''),
    'ASDFGHJKL'.split(''),
    ['Enter', ...'ZXCVBNM'.split(''), '⌫'],
  ];

  const handleVirtualKey = (key: string) => {
    if (gameStatus !== 'playing') return;
    if (key === 'Enter') {
      submitGuess();
      return;
    }
    if (key === '⌫') {
      setCurrentGuess(prev => prev.slice(0, -1));
      return;
    }
    const ch = key.toLowerCase();
    if (/^[a-z]$/.test(ch)) {
      setCurrentGuess(prev => (prev.length < wordLength ? prev + ch : prev));
    }
  };

  const accuracy = useMemo(() => {
    if (stats.played === 0) return 0;
    return Math.round((stats.wins / stats.played) * 100);
  }, [stats]);

  const hintText = useMemo(() => {
    if (!showHint || !targetWord) return '';
    const unique = new Set(targetWord.split('')).size;
    return `提示：以 ${targetWord[0].toUpperCase()} 开头，以 ${targetWord[targetWord.length - 1].toUpperCase()} 结尾，包含 ${unique} 种不同字母`;
  }, [showHint, targetWord]);

  return (
    <ToolLayout title="单词游戏" description="简单的单词猜测游戏，寓教于乐。">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 flex items-center justify-center gap-2">
            <BookOpen className="h-8 w-8" />
            单词游戏
          </h1>
          <p className="text-gray-600 dark:text-gray-400">输入字母猜测目标单词，颜色反馈提示位置与存在</p>
        </div>

        {/* 顶部控制 */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">词长</span>
            <div className="flex gap-2">
              {Array.from({ length: MAX_WORD_LENGTH - MIN_WORD_LENGTH + 1 }, (_, i) => MIN_WORD_LENGTH + i).map(len => (
                <button
                  key={len}
                  onClick={() => setWordLength(len)}
                  className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                    wordLength === len
                      ? 'bg-blue-600 border-blue-700 text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">模式</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'random' | 'daily')}
                className="px-3 py-1 rounded-md border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
              >
                <option value="random">随机模式</option>
                <option value="daily">每日模式</option>
              </select>
            </div>

            <button
              onClick={startNewGame}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white"
            >
              <RefreshCcw className="h-4 w-4" />
              新开一局
            </button>
          </div>
        </div>

        {/* 网格 */}
        <div className="flex flex-col items-center gap-2">
          {rows.map((cols, rIdx) => (
            <div key={rIdx} className="flex gap-2">{cols}</div>
          ))}
        </div>

        {/* 输入与操作 */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={currentGuess.toUpperCase()}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, wordLength).toLowerCase();
                setCurrentGuess(val);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submitGuess();
                }
              }}
              placeholder={`输入 ${wordLength} 个字母...`}
              className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={submitGuess}
              disabled={gameStatus !== 'playing'}
              className={`px-4 py-2 rounded-md font-medium ${
                gameStatus === 'playing' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              提交
            </button>
          </div>

          {message && (
            <div className="text-sm text-blue-700 dark:text-blue-300">{message}</div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHint(v => !v)}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm border ${
                showHint ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              {showHint ? '隐藏提示' : '显示提示'}
            </button>
            {hintText && <div className="text-sm text-gray-700 dark:text-gray-300">{hintText}</div>}
          </div>
        </div>

        {/* 屏幕键盘 */}
        <div className="space-y-2 select-none">
          {keyboardRows.map((row, idx) => (
            <div key={idx} className="flex justify-center gap-2">
              {row.map((k) => {
                const label = k === '⌫' ? '退格' : k;
                const state = k.length === 1 ? keyboardState[k] : undefined;
                const wide = k === 'Enter' ? 'px-4' : k === '⌫' ? 'px-4' : 'px-3';
                return (
                  <button
                    key={k}
                    onClick={() => handleVirtualKey(k)}
                    className={`${getKeyClass(state)} ${wide} py-2 rounded-md text-sm font-medium`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="text-xs text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1"><BarChart3 className="h-3 w-3" />对局</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.played}</div>
          </div>
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="text-xs text-green-800 dark:text-green-300 mb-1">胜场</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.wins}</div>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <div className="text-xs text-purple-800 dark:text-purple-300 mb-1">连胜</div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.currentStreak}</div>
          </div>
          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <div className="text-xs text-orange-800 dark:text-orange-300 mb-1">胜率</div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{accuracy}%</div>
          </div>
        </div>

        {/* 规则说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">玩法说明</h3>
          <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
            <li>• 在 {MAX_ATTEMPTS} 次内猜出目标单词</li>
            <li>• 绿色表示字母和位置都正确</li>
            <li>• 黄色表示字母存在但位置不对</li>
            <li>• 灰色表示该字母不在目标单词中</li>
            <li>• 可切换“词长”和“随机/每日模式”，点击“新开一局”重新开始</li>
            <li>• 支持物理键盘与屏幕键盘输入</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}