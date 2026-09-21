import React, { useState } from 'react';
import {
  type BoardState,
  createEmptyBoard,
  type Point,
  playMove,
  cloneBoard,
  getLegalMoves,
} from '../engine/goLogic';
import { getAiMove, type AiDifficulty } from '../engine/ai';
import { GameBoard } from './GameBoard';
import { SuccessModal } from './SuccessModal';
import { sounds } from '../utils/sound';
import { voice } from '../utils/speech';
import {
  Glasses,
  RotateCcw,
  Undo2,
  Trophy,
  Bot,
  User,
  Lightbulb,
  Play,
  Settings2,
  Sparkles,
} from 'lucide-react';

export const AiBattleView: React.FC = () => {
  // 对局设置状态
  const [boardSize, setBoardSize] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<AiDifficulty>('easy');
  const [playerFirst, setPlayerFirst] = useState<boolean>(true); // 玩家先手还是萌宠先手

  // 游戏进行状态
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [board, setBoard] = useState<BoardState>(() => createEmptyBoard(5));
  const [history, setHistory] = useState<BoardState[]>([]);
  const [lastMove, setLastMove] = useState<Point | null>(null);
  const [highlightPoints, setHighlightPoints] = useState<Point[]>([]);
  const [playerCaptures, setPlayerCaptures] = useState<number>(0);
  const [aiCaptures, setAiCaptures] = useState<number>(0);
  const [showLiberties, setShowLiberties] = useState<boolean>(true);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [aiSpeech, setAiSpeech] = useState<string>('小主人，来和我下一局吃子棋吧！');
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

  // 目标吃子胜利阈值：5x5为1子，7x7为2子，9x9为3子
  const targetWinCaptures = boardSize === 5 ? 1 : boardSize === 7 ? 2 : 3;

  // 启动新对弈
  const handleStartGame = (
    size = boardSize,
    diff = difficulty,
    isPlayerFirst = playerFirst
  ) => {
    sounds.playClick();
    const initialBoard = createEmptyBoard(size);
    setBoard(initialBoard);
    setHistory([]);
    setLastMove(null);
    setHighlightPoints([]);
    setPlayerCaptures(0);
    setAiCaptures(0);
    setWinner(null);
    setGameStarted(true);

    if (isPlayerFirst) {
      setIsAiThinking(false);
      const welcome =
        diff === 'easy'
          ? '喵~ 你是黑小猫，你先走第一步哦！'
          : '狐狸准备好啦，小主人请执黑先下！';
      setAiSpeech(welcome);
      voice.speak(welcome);
    } else {
      // 萌宠先下（AI执白或执黑走首步，这里让AI执白先下一颗）
      setIsAiThinking(true);
      setAiSpeech('我先下一颗示范一下哦，看招！');
      voice.speak('我先下一颗示范一下哦！');

      setTimeout(() => {
        // AI走中央天元
        const center = Math.floor(size / 2);
        const aiRes = playMove(initialBoard, center, center, 'white');
        if (aiRes.valid) {
          sounds.playStone();
          setBoard(aiRes.newBoard);
          setLastMove({ r: center, c: center });
          setAiSpeech('喵~ 我占领了正中间，轮到你下小黑猫啦！');
          voice.speak('轮到你落子啦！');
        }
        setIsAiThinking(false);
      }, 700);
    }
  };

  // 玩家落子（玩家执黑）
  const handleCellClick = (r: number, c: number) => {
    if (isAiThinking || winner || !gameStarted) return;

    // 清除提示高亮
    setHighlightPoints([]);

    // 保存悔棋历史
    const oldBoard = cloneBoard(board);

    const result = playMove(board, r, c, 'black');
    if (!result.valid) {
      sounds.playInvalid();
      const reason = result.reason || '这里不能落子哦！';
      setAiSpeech(reason);
      voice.speak(reason);
      return;
    }

    sounds.playStone();
    setLastMove({ r, c });
    const nextBoard = result.newBoard;
    setBoard(nextBoard);
    setHistory(prev => [...prev, oldBoard]);

    let newPlayerCaps = playerCaptures;
    if (result.captured.length > 0) {
      sounds.playCapture();
      newPlayerCaps += result.captured.length;
      setPlayerCaptures(newPlayerCaps);
      setAiSpeech(`哇！吃掉了我 ${result.captured.length} 只小兔子！太强啦！`);
    }

    // 检查玩家是否达成吃子目标获胜
    if (newPlayerCaps >= targetWinCaptures) {
      setWinner('player');
      return;
    }

    // 轮到 AI 思考并落子
    setIsAiThinking(true);
    setAiSpeech('萌宠正在转动脑筋思考中...');

    setTimeout(() => {
      const aiDecision = getAiMove(nextBoard, 'white', difficulty);
      if (aiDecision.point) {
        const aiRes = playMove(nextBoard, aiDecision.point.r, aiDecision.point.c, 'white');
        if (aiRes.valid) {
          sounds.playStone();
          setBoard(aiRes.newBoard);
          setLastMove(aiDecision.point);
          setAiSpeech(aiDecision.comment);

          let newAiCaps = aiCaptures;
          if (aiRes.captured.length > 0) {
            sounds.playCapture();
            sounds.playWarning();
            newAiCaps += aiRes.captured.length;
            setAiCaptures(newAiCaps);
          }

          if (newAiCaps >= targetWinCaptures) {
            setWinner('ai');
          }
        }
      } else {
        // AI 无处下子，判玩家胜利
        setWinner('player');
      }
      setIsAiThinking(false);
    }, 650);
  };

  // 悔棋功能
  const handleUndo = () => {
    if (history.length === 0 || isAiThinking || winner) return;
    sounds.playClick();
    const prevBoard = history[history.length - 1];
    setBoard(prevBoard);
    setHistory(prev => prev.slice(0, prev.length - 1));
    setLastMove(null);
    setHighlightPoints([]);
    setAiSpeech('好哒，允许你悔一步棋哦！');
    voice.speak('允许你悔一步棋哦！');
  };

  // 小提示功能（求助小灯泡）
  const handleShowHint = () => {
    if (isAiThinking || winner) return;
    sounds.playClick();
    // 找出所有合法步，优先推荐离中心最近或者能吃子的步
    const legalMoves = getLegalMoves(board, 'black');
    if (legalMoves.length === 0) return;

    // 优先看是否有吃子步
    const captureMove = legalMoves.find(m => {
      const res = playMove(board, m.r, m.c, 'black');
      return res.valid && res.captured.length > 0;
    });

    const chosen = captureMove || legalMoves[0];
    setHighlightPoints([chosen]);
    const hintText = captureMove ? '看！下在闪烁星星这里，能吃掉萌宠的子哦！' : '试着下在星星闪烁的十字路口吧！';
    setAiSpeech(hintText);
    voice.speak(hintText);
  };

  return (
    <div className="w-full max-w-xl mx-auto py-2 px-3 flex flex-col items-center">
      {/* 胜利弹窗 */}
      <SuccessModal
        isOpen={winner === 'player'}
        title="大获全胜！"
        message={`太棒了！率先抓住了 ${targetWinCaptures} 颗棋子，你真是围棋小神童！`}
        hasNextLevel={false}
        onRetry={() => handleStartGame()}
      />

      {/* 惜败弹窗 */}
      <SuccessModal
        isOpen={winner === 'ai'}
        title="差一点点就赢啦！"
        message="萌宠侥幸赢了这局，别灰心，再来一盘一定能抓住它！"
        hasNextLevel={false}
        onRetry={() => handleStartGame()}
      />

      {/* --- 若尚未启动对局，展示极富童趣的【启动对局设置卡片】 --- */}
      {!gameStarted ? (
        <div className="w-full bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-amber-400 text-center flex flex-col items-center animate-fade-in my-3">
          {/* 萌宠头像 */}
          <div className="w-20 h-20 rounded-3xl bg-amber-300 border-4 border-white shadow-lg flex items-center justify-center text-5xl mb-3 animate-gentle">
            {difficulty === 'easy' ? '🐱' : '🦊'}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 mb-1 flex items-center gap-1.5">
            <Sparkles className="text-amber-500 fill-amber-400" />
            萌宠围棋对弈场
          </h2>
          <p className="text-sm sm:text-base text-amber-800/90 font-medium mb-5">
            挑选你喜欢的棋盘和小伙伴，随时开始下棋吧！
          </p>

          {/* 1. 棋盘规格选择 */}
          <div className="w-full mb-4 text-left">
            <div className="text-xs font-extrabold text-amber-900 mb-2 flex items-center gap-1">
              <span>📏 选择棋盘大小：</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { size: 5, label: '5×5 小萌盘', desc: '吃1子即胜 (极速)' },
                { size: 7, label: '7×7 趣味盘', desc: '吃2子即胜 (推荐)' },
                { size: 9, label: '9×9 进阶盘', desc: '吃3子即胜 (挑战)' },
              ].map(item => (
                <button
                  key={item.size}
                  onClick={() => {
                    sounds.playClick();
                    setBoardSize(item.size);
                  }}
                  className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center text-center ${
                    boardSize === item.size
                      ? 'bg-amber-400 border-amber-600 text-amber-950 shadow-md font-black scale-102'
                      : 'bg-white/80 border-amber-200 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  <span className="text-sm sm:text-base font-black">{item.label}</span>
                  <span className="text-[10px] text-amber-800/80 mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. 萌宠对手选择 */}
          <div className="w-full mb-4 text-left">
            <div className="text-xs font-extrabold text-amber-900 mb-2 flex items-center gap-1">
              <span>🐾 选择你的萌宠小伙伴：</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sounds.playClick();
                  setDifficulty('easy');
                }}
                className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  difficulty === 'easy'
                    ? 'bg-emerald-300 border-emerald-500 text-emerald-950 shadow-md font-black'
                    : 'bg-white/80 border-amber-200 text-amber-900 hover:bg-emerald-100/50'
                }`}
              >
                <span className="text-3xl">🐱</span>
                <div className="text-left">
                  <div className="text-sm sm:text-base font-black">呆萌猫猫</div>
                  <div className="text-[11px] text-emerald-800">初学首选·经常放水</div>
                </div>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setDifficulty('medium');
                }}
                className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  difficulty === 'medium'
                    ? 'bg-indigo-300 border-indigo-500 text-indigo-950 shadow-md font-black'
                    : 'bg-white/80 border-amber-200 text-amber-900 hover:bg-indigo-100/50'
                }`}
              >
                <span className="text-3xl">🦊</span>
                <div className="text-left">
                  <div className="text-sm sm:text-base font-black">机灵小狐</div>
                  <div className="text-[11px] text-indigo-800">会主动吃子和逃跑</div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. 谁先下 */}
          <div className="w-full mb-6 text-left">
            <div className="text-xs font-extrabold text-amber-900 mb-2 flex items-center gap-1">
              <span>🎯 谁先走第一步：</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sounds.playClick();
                  setPlayerFirst(true);
                }}
                className={`p-2.5 rounded-2xl border-2 transition-all text-center text-xs sm:text-sm font-black ${
                  playerFirst
                    ? 'bg-amber-400 border-amber-600 text-amber-950 shadow'
                    : 'bg-white/80 border-amber-200 text-amber-900 hover:bg-amber-100'
                }`}
              >
                🐱 我先下（执黑子）
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setPlayerFirst(false);
                }}
                className={`p-2.5 rounded-2xl border-2 transition-all text-center text-xs sm:text-sm font-black ${
                  !playerFirst
                    ? 'bg-amber-400 border-amber-600 text-amber-950 shadow'
                    : 'bg-white/80 border-amber-200 text-amber-900 hover:bg-amber-100'
                }`}
              >
                🐰 萌宠先下（示范）
              </button>
            </div>
          </div>

          {/* 启动大按钮 */}
          <button
            onClick={() => handleStartGame(boardSize, difficulty, playerFirst)}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xl sm:text-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play size={26} fill="white" />
            启动萌宠下棋！
          </button>
        </div>
      ) : (
        /* --- 对局进行中界面 --- */
        <>
          {/* 顶部控制栏与调整设置 */}
          <div className="w-full flex items-center justify-between gap-2 mb-2">
            <button
              onClick={() => {
                sounds.playClick();
                setGameStarted(false);
              }}
              className="p-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs flex items-center gap-1 shadow-sm"
            >
              <Settings2 size={16} />
              换棋盘/对手
            </button>

            <div className="px-3 py-1 bg-amber-300/90 rounded-full font-black text-xs sm:text-sm text-amber-950 shadow-inner flex items-center gap-1">
              <Trophy size={14} className="text-amber-700" />
              <span>{boardSize}×{boardSize} 盘 · 先吃 {targetWinCaptures} 颗子获胜</span>
            </div>

            <button
              onClick={() => handleStartGame()}
              className="p-2 rounded-xl bg-orange-200 hover:bg-orange-300 text-orange-950 font-bold text-xs flex items-center gap-1 shadow-sm"
            >
              <RotateCcw size={16} />
              重新开局
            </button>
          </div>

          {/* 比分牌 */}
          <div className="w-full flex items-center justify-between gap-3 mb-2 bg-gradient-to-r from-amber-200 via-orange-100 to-amber-200 p-2.5 rounded-2xl border-2 border-amber-300 shadow-sm">
            {/* 玩家 */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-bold text-lg shadow">
                <User size={20} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-amber-900">你（黑小猫）</div>
                <div className="text-sm font-black text-emerald-700">
                  抓到: {playerCaptures} / {targetWinCaptures}
                </div>
              </div>
            </div>

            {/* 回合提示器 */}
            <div className="text-center">
              {isAiThinking ? (
                <div className="px-2.5 py-1 bg-amber-300 text-amber-900 rounded-full text-xs font-black animate-pulse flex items-center gap-1">
                  <span>💭 思考中...</span>
                </div>
              ) : (
                <div className="px-2.5 py-1 bg-emerald-400 text-emerald-950 rounded-full text-xs font-black shadow-sm flex items-center gap-1 animate-bounce">
                  <span>🟢 轮到你下</span>
                </div>
              )}
            </div>

            {/* AI萌宠 */}
            <div className="flex items-center gap-2 flex-row-reverse">
              <div className="w-10 h-10 rounded-2xl bg-white text-slate-800 border-2 border-slate-300 flex items-center justify-center font-bold text-lg shadow">
                <Bot size={20} className="text-orange-500" />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-amber-900">
                  {difficulty === 'easy' ? '呆萌猫' : '机灵狐'}
                </div>
                <div className="text-sm font-black text-rose-700">
                  抓到: {aiCaptures} / {targetWinCaptures}
                </div>
              </div>
            </div>
          </div>

          {/* 萌宠说话气泡 */}
          <div className="w-full bg-white/95 rounded-2xl p-2.5 shadow border-2 border-amber-300 mb-2.5 text-center flex items-center justify-center gap-2">
            <span className="text-lg">💬</span>
            <span className="text-amber-950 font-black text-xs sm:text-sm">
              {aiSpeech}
            </span>
          </div>

          {/* 棋盘主体 */}
          <div className="w-full flex justify-center mb-2.5">
            <GameBoard
              board={board}
              onCellClick={handleCellClick}
              lastMove={lastMove}
              highlightPoints={highlightPoints}
              showLiberties={showLiberties}
              disabled={isAiThinking || !!winner}
              hoverColor="black"
            />
          </div>

          {/* 底部交互功能栏 */}
          <div className="w-full grid grid-cols-3 gap-2 sm:gap-3">
            {/* 透视镜 */}
            <button
              onClick={() => {
                sounds.playClick();
                setShowLiberties(!showLiberties);
              }}
              className={`py-2.5 px-2 rounded-2xl font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex flex-col items-center justify-center gap-1 border-2 ${
                showLiberties
                  ? 'bg-emerald-200 border-emerald-400 text-emerald-950'
                  : 'bg-stone-200 border-stone-300 text-stone-600'
              }`}
            >
              <Glasses size={20} className={showLiberties ? 'text-emerald-600' : 'text-stone-500'} />
              <span>透视镜: {showLiberties ? '开' : '关'}</span>
            </button>

            {/* 悔棋 */}
            <button
              onClick={handleUndo}
              disabled={history.length === 0 || isAiThinking || !!winner}
              className="py-2.5 px-2 rounded-2xl bg-amber-300 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed border-2 border-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
            >
              <Undo2 size={20} className="text-amber-700" />
              <span>悔一步</span>
            </button>

            {/* 求助小提示 */}
            <button
              onClick={handleShowHint}
              disabled={isAiThinking || !!winner}
              className="py-2.5 px-2 rounded-2xl bg-amber-300 hover:bg-amber-400 disabled:opacity-40 border-2 border-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
            >
              <Lightbulb size={20} className="text-amber-700 fill-amber-400" />
              <span>小提示</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
