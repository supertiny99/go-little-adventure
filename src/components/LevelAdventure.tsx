import React, { useState, useEffect, useCallback } from 'react';
import type { Level } from '../data/levels';
import { type BoardState, type Point, playMove, getLegalMoves } from '../engine/goLogic';
import { getAiMove } from '../engine/ai';
import { GameBoard } from './GameBoard';
import { LessonModal } from './LessonModal';
import { SuccessModal } from './SuccessModal';
import { sounds } from '../utils/sound';
import { voice } from '../utils/speech';
import { Lightbulb, Glasses, RotateCcw, Map, BookOpen, Heart } from 'lucide-react';

interface LevelAdventureProps {
  level: Level;
  onBackToMap: () => void;
  onLevelComplete: (levelId: number) => void;
  onNextLevel: () => void;
  hasNextLevel: boolean;
}

export const LevelAdventure: React.FC<LevelAdventureProps> = ({
  level,
  onBackToMap,
  onLevelComplete,
  onNextLevel,
  hasNextLevel,
}) => {
  const [board, setBoard] = useState<BoardState>(() => level.setup());
  const [lastMove, setLastMove] = useState<Point | null>(null);
  const [highlightPoints, setHighlightPoints] = useState<Point[]>([]);
  const [showLiberties, setShowLiberties] = useState<boolean>(true);
  const [showLesson, setShowLesson] = useState<boolean>(true);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [capturedByPlayer, setCapturedByPlayer] = useState<number>(0);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [message, setMessage] = useState<string>(level.goal);

  // 初始化重置关卡
  const resetLevel = useCallback(() => {
    setBoard(level.setup());
    setLastMove(null);
    setHighlightPoints([]);
    setCapturedByPlayer(0);
    setIsAiThinking(false);
    setShowSuccess(false);
    setMessage(level.goal);
  }, [level]);

  useEffect(() => {
    resetLevel();
    setShowLesson(true);
  }, [level, resetLevel]);

  // 处理玩家落子
  const handleCellClick = (r: number, c: number) => {
    if (isAiThinking || showSuccess) return;

    // 清除提示高亮
    setHighlightPoints([]);

    const result = playMove(board, r, c, level.playerColor);
    if (!result.valid) {
      sounds.playInvalid();
      setMessage(result.reason || '这里不能落子哦！');
      voice.speak(result.reason || '这里不能落子哦！');
      return;
    }

    // 播放落子音效
    sounds.playStone();
    setLastMove({ r, c });
    const newBoard = result.newBoard;
    setBoard(newBoard);

    const newlyCaptured = result.captured.length;
    let totalCaptured = capturedByPlayer;

    if (newlyCaptured > 0) {
      sounds.playCapture();
      totalCaptured += newlyCaptured;
      setCapturedByPlayer(totalCaptured);
      setMessage(`哇！吃掉了 ${newlyCaptured} 只小白兔！太厉害啦！`);
    }

    // --- 关卡胜负判定 ---
    // 关卡 1: 只要在小白兔相邻门落子存活即算通过
    if (level.id === 1) {
      if (level.solutionMoves?.some(m => m.r === r && m.c === c)) {
        setTimeout(() => {
          setShowSuccess(true);
          onLevelComplete(level.id);
        }, 500);
        return;
      }
    }

    // 关卡 2, 3, 7, 8, 9, 10: 吃子手筋谜题（吃掉指定数量小白兔或下入正解点即通关）
    if ([2, 3, 7, 8, 9, 10].includes(level.id)) {
      const isSolutionMove = level.solutionMoves?.some(m => m.r === r && m.c === c);
      if (totalCaptured >= (level.targetCaptures || 1) || isSolutionMove) {
        setTimeout(() => {
          setShowSuccess(true);
          onLevelComplete(level.id);
        }, 600);
        return;
      }
    }

    // 关卡 4 (手拉手) & 关卡 11 (扣上大草帽封锁): 下在目标位置即获胜
    if (level.id === 4 || level.id === 11) {
      if (level.solutionMoves?.some(m => m.r === r && m.c === c)) {
        setTimeout(() => {
          setShowSuccess(true);
          onLevelComplete(level.id);
        }, 500);
        return;
      }
    }

    // 关卡 5: 避开禁着点，落在安全区域即通过
    if (level.id === 5) {
      if (!(r === 2 && c === 2)) {
        setTimeout(() => {
          setShowSuccess(true);
          onLevelComplete(level.id);
        }, 500);
        return;
      }
    }

    // 关卡 6 (5x5 实战) & 关卡 12 (7x7 终极决战)
    if (level.id === 6 || level.id === 12) {
      const required = level.targetCaptures || (level.id === 12 ? 2 : 1);
      if (totalCaptured >= required) {
        setTimeout(() => {
          setShowSuccess(true);
          onLevelComplete(level.id);
        }, 600);
        return;
      }

      // 轮到 AI 落子
      setIsAiThinking(true);
      setMessage(level.id === 12 ? '机灵小狐狸正在思考中...' : '小白兔正在思考中...');

      const aiDiff = level.id === 12 ? 'medium' : 'easy';
      setTimeout(() => {
        const aiDecision = getAiMove(newBoard, 'white', aiDiff);
        if (aiDecision.point) {
          const aiRes = playMove(newBoard, aiDecision.point.r, aiDecision.point.c, 'white');
          if (aiRes.valid) {
            sounds.playStone();
            setBoard(aiRes.newBoard);
            setLastMove(aiDecision.point);

            if (aiRes.captured.length > 0) {
              sounds.playCapture();
              sounds.playWarning();
              setMessage('哎呀，小黑猫被抓走了一只，快反击！');
            } else {
              setMessage(aiDecision.comment);
            }
          }
        } else {
          // AI 无路可走，玩家胜
          setShowSuccess(true);
          onLevelComplete(level.id);
        }
        setIsAiThinking(false);
      }, 700);
    }
  };

  // 点击提示按钮
  const handleShowHint = () => {
    sounds.playClick();
    if (level.solutionMoves && level.solutionMoves.length > 0) {
      setHighlightPoints(level.solutionMoves);
      voice.speak(level.hint);
      setMessage(level.hint);
    } else {
      // 动态寻找一个合法落子点
      const legals = getLegalMoves(board, level.playerColor);
      if (legals.length > 0) {
        setHighlightPoints([legals[0]]);
        voice.speak('试着下在星星闪烁的地方哦！');
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-3 px-3 flex flex-col items-center">
      {/* 关卡引导故事弹窗 */}
      <LessonModal
        level={level}
        isOpen={showLesson}
        onStart={() => setShowLesson(false)}
      />

      {/* 胜利弹窗 */}
      <SuccessModal
        isOpen={showSuccess}
        title="闯关成功！"
        message={`恭喜你完成了第 ${level.id} 关【${level.title}】！`}
        hasNextLevel={hasNextLevel}
        onNext={onNextLevel}
        onRetry={resetLevel}
      />

      {/* 顶部控制栏 */}
      <div className="w-full flex items-center justify-between gap-2 mb-3">
        <button
          onClick={() => {
            sounds.playClick();
            onBackToMap();
          }}
          className="p-2.5 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold shadow-md active:scale-95 transition-all flex items-center gap-1 text-sm"
        >
          <Map size={18} />
          地图
        </button>

        <div className="flex-1 text-center">
          <div className="inline-block px-3 py-1 bg-amber-300/80 rounded-full text-amber-950 font-black text-base shadow-sm">
            第 {level.id} 关：{level.title}
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            setShowLesson(true);
          }}
          className="p-2.5 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold shadow-md active:scale-95 transition-all flex items-center gap-1 text-sm"
          title="查看讲解"
        >
          <BookOpen size={18} />
          故事
        </button>
      </div>

      {/* 提示与状态气泡 */}
      <div className="w-full bg-white/90 rounded-2xl p-3 shadow-md border-2 border-amber-300 mb-3 text-center flex items-center justify-center gap-2">
        <Heart className="text-rose-500 fill-rose-500 shrink-0" size={20} />
        <span className="text-amber-950 font-black text-sm sm:text-base">
          {message}
        </span>
      </div>

      {/* 棋盘主体 */}
      <div className="w-full flex justify-center mb-4">
        <GameBoard
          board={board}
          onCellClick={handleCellClick}
          lastMove={lastMove}
          highlightPoints={highlightPoints}
          showLiberties={showLiberties}
          disabled={isAiThinking || showSuccess}
        />
      </div>

      {/* 底部儿童交互功能大按钮 */}
      <div className="w-full grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* 透视眼镜开关 */}
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

        {/* 提示小灯泡 */}
        <button
          onClick={handleShowHint}
          className="py-3 px-2 rounded-2xl bg-amber-300 hover:bg-amber-400 border-2 border-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
        >
          <Lightbulb size={22} className="text-amber-700 fill-amber-500" />
          <span>小提示</span>
        </button>

        {/* 重新开始 */}
        <button
          onClick={() => {
            sounds.playClick();
            resetLevel();
          }}
          className="py-3 px-2 rounded-2xl bg-orange-200 hover:bg-orange-300 border-2 border-orange-400 text-orange-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
        >
          <RotateCcw size={22} className="text-orange-700" />
          <span>重玩本关</span>
        </button>
      </div>
    </div>
  );
};
