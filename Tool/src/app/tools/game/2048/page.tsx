'use client';

import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Target, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useLanguage } from '@/components/language-provider';

type Board = number[][];
type Direction = 'up' | 'down' | 'left' | 'right';

interface GameStats {
  score: number;
  moves: number;
  best: number;
}

// 游戏配置
const BOARD_SIZE = 4;
const INITIAL_TILES = 2;

// 创建空棋盘
const createEmptyBoard = (): Board => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
};

// 获取空格位置
const getEmptyTiles = (board: Board): [number, number][] => {
  const empty: [number, number][] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j] === 0) {
        empty.push([i, j]);
      }
    }
  }
  return empty;
};

// 添加随机数字瓦片
const addRandomTile = (board: Board): Board => {
  const emptyTiles = getEmptyTiles(board);
  if (emptyTiles.length === 0) return board;
  
  const newBoard = board.map(row => [...row]);
  const randomIndex = Math.floor(Math.random() * emptyTiles.length);
  const [row, col] = emptyTiles[randomIndex];
  newBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
  
  return newBoard;
};

// 初始化游戏棋盘
const initializeBoard = (): Board => {
  let board = createEmptyBoard();
  for (let i = 0; i < INITIAL_TILES; i++) {
    board = addRandomTile(board);
  }
  return board;
};

// 移动和合并逻辑
const moveLeft = (board: Board): { board: Board; score: number; moved: boolean } => {
  let totalScore = 0;
  let moved = false;
  const newBoard = board.map(row => {
    const filteredRow = row.filter(val => val !== 0);
    const mergedRow: number[] = [];
    let i = 0;
    
    while (i < filteredRow.length) {
      if (i < filteredRow.length - 1 && filteredRow[i] === filteredRow[i + 1]) {
        const merged = filteredRow[i] * 2;
        mergedRow.push(merged);
        totalScore += merged;
        i += 2;
      } else {
        mergedRow.push(filteredRow[i]);
        i++;
      }
    }
    
    while (mergedRow.length < BOARD_SIZE) {
      mergedRow.push(0);
    }
    
    // 检查是否有移动
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (row[j] !== mergedRow[j]) {
        moved = true;
      }
    }
    
    return mergedRow;
  });
  
  return { board: newBoard, score: totalScore, moved };
};

// 旋转棋盘
const rotateBoard = (board: Board): Board => {
  const newBoard = createEmptyBoard();
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      newBoard[j][BOARD_SIZE - 1 - i] = board[i][j];
    }
  }
  return newBoard;
};

// 处理不同方向的移动
const move = (board: Board, direction: Direction): { board: Board; score: number; moved: boolean } => {
  let rotations = 0;
  let currentBoard = [...board.map(row => [...row])];
  
  switch (direction) {
    case 'up':
      rotations = 3;
      break;
    case 'right':
      rotations = 2;
      break;
    case 'down':
      rotations = 1;
      break;
    case 'left':
      rotations = 0;
      break;
  }
  
  // 旋转到左移位置
  for (let i = 0; i < rotations; i++) {
    currentBoard = rotateBoard(currentBoard);
  }
  
  // 执行左移
  const result = moveLeft(currentBoard);
  
  // 旋转回原位置
  for (let i = 0; i < (4 - rotations) % 4; i++) {
    result.board = rotateBoard(result.board);
  }
  
  return result;
};

// 检查游戏是否结束
const isGameOver = (board: Board): boolean => {
  // 检查是否还有空格
  if (getEmptyTiles(board).length > 0) return false;
  
  // 检查是否还能合并
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const current = board[i][j];
      if (
        (i < BOARD_SIZE - 1 && board[i + 1][j] === current) ||
        (j < BOARD_SIZE - 1 && board[i][j + 1] === current)
      ) {
        return false;
      }
    }
  }
  
  return true;
};

// 检查是否获胜
const isWinner = (board: Board): boolean => {
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j] === 2048) return true;
    }
  }
  return false;
};

// 获取瓦片颜色
const getTileColor = (value: number): string => {
  const colors: Record<number, string> = {
    2: 'bg-gray-100 text-gray-800',
    4: 'bg-gray-200 text-gray-800',
    8: 'bg-orange-200 text-orange-800',
    16: 'bg-orange-300 text-orange-900',
    32: 'bg-orange-400 text-white',
    64: 'bg-orange-500 text-white',
    128: 'bg-yellow-400 text-white',
    256: 'bg-yellow-500 text-white',
    512: 'bg-yellow-600 text-white',
    1024: 'bg-red-500 text-white',
    2048: 'bg-red-600 text-white',
  };
  
  return colors[value] || 'bg-red-700 text-white';
};

export default function Game2048Page() {
  const { t } = useLanguage();
  const [board, setBoard] = useState<Board>(initializeBoard());
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    moves: 0,
    best: parseInt(localStorage.getItem('2048-best') || '0'),
  });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  // 处理移动
  const handleMove = useCallback((direction: Direction) => {
    if (gameOver && !winner) return;
    
    const result = move(board, direction);
    if (!result.moved) return;
    
    const newBoard = addRandomTile(result.board);
    setBoard(newBoard);
    
    const newScore = gameStats.score + result.score;
    const newBest = Math.max(gameStats.best, newScore);
    
    setGameStats(prev => ({
      score: newScore,
      moves: prev.moves + 1,
      best: newBest,
    }));
    
    // 保存最高分
    localStorage.setItem('2048-best', newBest.toString());
    
    // 检查游戏状态
    if (isWinner(newBoard) && !winner) {
      setWinner(true);
    }
    
    if (isGameOver(newBoard)) {
      setGameOver(true);
      setTimeout(() => setShowGameOver(true), 500);
    }
  }, [board, gameStats, gameOver, winner]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleMove('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleMove('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleMove('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleMove('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleMove]);

  // 重新开始游戏
  const restartGame = () => {
    setBoard(initializeBoard());
    setGameStats(prev => ({
      score: 0,
      moves: 0,
      best: prev.best,
    }));
    setGameOver(false);
    setWinner(false);
    setShowGameOver(false);
  };

  // 继续游戏（获胜后）
  const continueGame = () => {
    setWinner(false);
  };

  return (
    <ToolLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* 标题区域 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            2048 游戏
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            移动数字瓦片，合并相同数字，目标是创造2048瓦片！
          </p>
        </div>

        {/* 游戏统计 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">得分</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {gameStats.score.toLocaleString()}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">步数</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {gameStats.moves}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">最高分</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {gameStats.best.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 游戏棋盘 */}
        <div className="bg-gray-300 dark:bg-gray-700 rounded-lg p-4 mx-auto w-fit">
          <div className="grid grid-cols-4 gap-2">
            {board.map((row, i) =>
              row.map((value, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl transition-all duration-200 ${
                    value === 0
                      ? 'bg-gray-200 dark:bg-gray-600'
                      : getTileColor(value)
                  }`}
                >
                  {value !== 0 && value}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <button
              onClick={restartGame}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>重新开始</span>
            </button>
          </div>

          {/* 移动控制（移动端） */}
          <div className="sm:hidden">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              滑动或使用按钮移动
            </div>
            <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
              <div></div>
              <button
                onClick={() => handleMove('up')}
                className="flex items-center justify-center p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowUp className="w-6 h-6" />
              </button>
              <div></div>
              
              <button
                onClick={() => handleMove('left')}
                className="flex items-center justify-center p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div></div>
              <button
                onClick={() => handleMove('right')}
                className="flex items-center justify-center p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
              
              <div></div>
              <button
                onClick={() => handleMove('down')}
                className="flex items-center justify-center p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowDown className="w-6 h-6" />
              </button>
              <div></div>
            </div>
          </div>
        </div>

        {/* 游戏说明 */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            游戏规则
          </h3>
          <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
            <li>• 使用方向键移动所有瓦片</li>
            <li>• 相同数字的瓦片碰撞时会合并成一个</li>
            <li>• 每次移动后会随机出现新的2或4瓦片</li>
            <li>• 目标是创造2048瓦片</li>
            <li>• 当棋盘填满且无法移动时游戏结束</li>
          </ul>
        </div>

        {/* 获胜弹窗 */}
        {winner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center space-y-4 mx-4">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                恭喜获胜！
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                你成功创造了2048瓦片！
              </p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={continueGame}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  继续游戏
                </button>
                <button
                  onClick={restartGame}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  重新开始
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 游戏结束弹窗 */}
        {showGameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center space-y-4 mx-4">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                游戏结束
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                最终得分: {gameStats.score.toLocaleString()}
              </p>
              <button
                onClick={restartGame}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                再试一次
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}