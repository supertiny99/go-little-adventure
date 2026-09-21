import React, { useState } from 'react';
import {
  type BoardState,
  createEmptyBoard,
  type Point,
  playMove,
  cloneBoard,
} from '../engine/goLogic';
import { getAiMove, type AiDifficulty } from '../engine/ai';
import { GameBoard } from './GameBoard';
import { SuccessModal } from './SuccessModal';
import { sounds } from '../utils/sound';
import { voice } from '../utils/speech';
import { Glasses, RotateCcw, Undo2, Trophy, Bot, User } from 'lucide-react';

export const AiBattleView: React.FC = () => {
  const [boardSize, setBoardSize] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<AiDifficulty>('easy');
  const [board, setBoard] = useState<BoardState>(() => createEmptyBoard(5));
  const [history, setHistory] = useState<BoardState[]>([]);
  const [lastMove, setLastMove] = useState<Point | null>(null);
  const [playerCaptures, setPlayerCaptures] = useState<number>(0);
  const [aiCaptures, setAiCaptures] = useState<number>(0);
  const [showLiberties, setShowLiberties] = useState<boolean>(true);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [aiSpeech, setAiSpeech] = useState<string>('小主人，来和我下一局吃子棋吧！');
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

  // 目标吃子胜利阈值：5x5为1子，7x7为2子，9x9为3子
  const targetWinCaptures = boardSize === 5 ? 1 : boardSize === 7 ? 2 : 3;

  // 开始新对弈
  const startNewGame = (newSize = boardSize, newDiff = difficulty) => {
    setBoard(createEmptyBoard(newSize));
    setHistory([]);
    setLastMove(null);
    setPlayerCaptures(0);
    setAiCaptures(0);
    setIsAiThinking(false);
    setWinner(null);
    setAiSpeech(newDiff === 'easy' ? '喵~ 新一局开始啦，我先让你一手！' : '小狐狸准备好咯，看招！');
  };

  // 玩家落子（玩家执黑先下）
  const handleCellClick = (r: number, c: number) => {
    if (isAiThinking || winner) return;

    // 保存悔棋历史
    const oldBoard = cloneBoard(board);

    const result = playMove(board, r, c, 'black');
    if (!result.valid) {
      sounds.playInvalid();
      setAiSpeech(result.reason || '这里不能落子哦！');
      voice.speak(result.reason || '这里不能落子哦！');
      return;
    }

    sounds.playStone();
    setLastMove({ r, c });
    const nextBoard = result.newBoard;
    setBoard(nextBoard);
    setHistory(prev => [...prev, oldBoard]);

    let currentPCaptures = playerCaptures;
    if (result.captured.length > 0) {
      sounds.playCapture();
      currentPCaptures += result.captured.length;
      setPlayerCaptures(currentPCaptures);
      setAiSpeech('哎呀！我的小棋子被你吃掉了！');
    }

    // 检查玩家是否获胜
    if (currentPCaptures >= targetWinCaptures) {
      setWinner('player');
      return;
    }

    // 轮到 AI 思考并落子
    setIsAiThinking(true);
    setTimeout(() => {
      const aiDecision = getAiMove(nextBoard, 'white', difficulty);
      if (aiDecision.point) {
        const aiRes = playMove(nextBoard, aiDecision.point.r, aiDecision.point.c, 'white');
        if (aiRes.valid) {
          sounds.playStone();
          setBoard(aiRes.newBoard);
          setLastMove(aiDecision.point);
          setAiSpeech(aiDecision.comment);

          let currentAiCaps = aiCaptures;
          if (aiRes.captured.length > 0) {
            sounds.playCapture();
            sounds.playWarning();
            currentAiCaps += aiRes.captured.length;
            setAiCaptures(currentAiCaps);
          }

          if (currentAiCaps >= targetWinCaptures) {
            setWinner('ai');
          }
        }
      } else {
        // AI 无处下子，判玩家胜利
        setWinner('player');
      }
      setIsAiThinking(false);
    }, 600);
  };

  // 悔棋功能
  const handleUndo = () => {
    if (history.length === 0 || isAiThinking || winner) return;
    sounds.playClick();
    const prevBoard = history[history.length - 1];
    setBoard(prevBoard);
    setHistory(prev => prev.slice(0, prev.length - 1));
    setLastMove(null);
    setAiSpeech('好哒，允许你悔一步棋哦！');
  };

  return (
    <div className="w-full max-w-xl mx-auto py-3 px-3 flex flex-col items-center">
      {/* 胜利弹窗 */}
      <SuccessModal
        isOpen={winner === 'player'}
        title="太棒了！获胜啦！"
        message={`率先抓住了 ${targetWinCaptures} 颗棋子，你真是围棋小天才！`}
        hasNextLevel={false}
        onRetry={() => startNewGame()}
      />

      {/* 惜败提示弹窗 */}
      <SuccessModal
        isOpen={winner === 'ai'}
        title="再接再厉！"
        message="差一点点就抓住它啦！再来一局，你一定能赢！"
        hasNextLevel={false}
        onRetry={() => startNewGame()}
      />

      {/* 模式选择横条 */}
      <div className="w-full flex items-center justify-between gap-2 mb-3 bg-white/70 p-2 rounded-2xl border-2 border-amber-200">
        {/* 盘面大小切换 */}
        <div className="flex gap-1">
          {[5, 7, 9].map(size => (
            <button
              key={size}
              onClick={() => {
                sounds.playClick();
                setBoardSize(size);
                startNewGame(size, difficulty);
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
                boardSize === size
                  ? 'bg-amber-500 text-white shadow'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
              }`}
            >
              {size}x{size}
            </button>
          ))}
        </div>

        {/* 难度切换 */}
        <div className="flex gap-1">
          <button
            onClick={() => {
              sounds.playClick();
              setDifficulty('easy');
              startNewGame(boardSize, 'easy');
            }}
            className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
              difficulty === 'easy'
                ? 'bg-emerald-500 text-white shadow'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950'
            }`}
          >
            🐱 呆萌猫
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setDifficulty('medium');
              startNewGame(boardSize, 'medium');
            }}
            className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
              difficulty === 'medium'
                ? 'bg-indigo-500 text-white shadow'
                : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-950'
            }`}
          >
            🦊 机灵狐
          </button>
        </div>
      </div>

      {/* 比分牌 */}
      <div className="w-full flex items-center justify-between gap-3 mb-3 bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200 p-3 rounded-2xl border-2 border-amber-400 shadow-sm">
        {/* 玩家（小黑猫） */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-lg shadow">
            <User size={20} />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-amber-900">你（黑子）</div>
            <div className="text-sm sm:text-base font-black text-emerald-700">
              抓到: {playerCaptures} / {targetWinCaptures}
            </div>
          </div>
        </div>

        <div className="px-2 py-1 bg-amber-300 rounded-full text-xs font-black text-amber-950 flex items-center gap-1 shadow-inner">
          <Trophy size={14} className="text-amber-700" />
          先吃{targetWinCaptures}子胜
        </div>

        {/* 萌宠（白小兔） */}
        <div className="flex items-center gap-2 flex-row-reverse">
          <div className="w-10 h-10 rounded-full bg-white text-slate-800 border-2 border-slate-300 flex items-center justify-center font-bold text-lg shadow">
            <Bot size={20} className="text-orange-500" />
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-amber-900">
              {difficulty === 'easy' ? '呆萌猫' : '机灵狐'}
            </div>
            <div className="text-sm sm:text-base font-black text-rose-700">
              抓到: {aiCaptures} / {targetWinCaptures}
            </div>
          </div>
        </div>
      </div>

      {/* AI萌宠对话气泡 */}
      <div className="w-full bg-white/90 rounded-2xl p-3 shadow-md border-2 border-amber-300 mb-3 text-center flex items-center justify-center gap-2">
        <span className="text-lg">💬</span>
        <span className="text-amber-950 font-black text-sm sm:text-base">
          {aiSpeech}
        </span>
      </div>

      {/* 棋盘主体 */}
      <div className="w-full flex justify-center mb-3">
        <GameBoard
          board={board}
          onCellClick={handleCellClick}
          lastMove={lastMove}
          showLiberties={showLiberties}
          disabled={isAiThinking || !!winner}
        />
      </div>

      {/* 底部功能栏 */}
      <div className="w-full grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* 透视镜 */}
        <button
          onClick={() => {
            sounds.playClick();
            setShowLiberties(!showLiberties);
          }}
          className={`py-3 px-2 rounded-2xl font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex flex-col items-center justify-center gap-1 border-2 ${
            showLiberties
              ? 'bg-emerald-200 border-emerald-400 text-emerald-950'
              : 'bg-stone-200 border-stone-300 text-stone-600'
          }`}
        >
          <Glasses size={22} className={showLiberties ? 'text-emerald-600' : 'text-stone-500'} />
          <span>透视镜: {showLiberties ? '开' : '关'}</span>
        </button>

        {/* 悔棋 */}
        <button
          onClick={handleUndo}
          disabled={history.length === 0 || isAiThinking}
          className="py-3 px-2 rounded-2xl bg-amber-300 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
        >
          <Undo2 size={22} className="text-amber-700" />
          <span>悔一步</span>
        </button>

        {/* 重新开局 */}
        <button
          onClick={() => {
            sounds.playClick();
            startNewGame();
          }}
          className="py-3 px-2 rounded-2xl bg-orange-200 hover:bg-orange-300 border-2 border-orange-400 text-orange-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
        >
          <RotateCcw size={22} className="text-orange-700" />
          <span>重新开局</span>
        </button>
      </div>
    </div>
  );
};
