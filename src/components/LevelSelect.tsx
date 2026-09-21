import React, { useState, useEffect } from 'react';
import { type Level, CHAPTERS } from '../data/levels';
import { sounds } from '../utils/sound';
import { Lock, Star, Play, Trophy, Sparkles } from 'lucide-react';

interface LevelSelectProps {
  levels: Level[];
  completedLevels: number[];
  onSelectLevel: (levelId: number) => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  levels,
  completedLevels,
  onSelectLevel,
}) => {
  // 根据孩子当前未完成的最高关卡，自动默认切换到对应章节
  const [selectedChapter, setSelectedChapter] = useState<1 | 2>(1);

  useEffect(() => {
    // 如果第 1~6 关全部完成了，且第 7 关未全部完成，自动聚焦到第 2 章
    const ch1Completed = [1, 2, 3, 4, 5, 6].every(id => completedLevels.includes(id));
    if (ch1Completed) {
      setSelectedChapter(2);
    }
  }, [completedLevels]);

  const currentChapterLevels = levels.filter(lvl => lvl.chapter === selectedChapter);
  const currentChapterInfo = CHAPTERS.find(c => c.id === selectedChapter)!;
  const chapterCompletedCount = currentChapterLevels.filter(lvl =>
    completedLevels.includes(lvl.id)
  ).length;

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-3 flex flex-col items-center">
      {/* 标题横幅 */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-5 py-2 bg-amber-200 border-2 border-amber-400 rounded-full shadow-sm text-amber-950 font-black text-lg sm:text-xl mb-1.5">
          <Sparkles className="text-amber-600 fill-amber-400" size={20} />
          <span>围棋冒险大地图</span>
        </div>
        <p className="text-amber-800 text-xs sm:text-sm font-medium">
          点击小岛，跟着小黑猫一起闯关学围棋吧！
        </p>
      </div>

      {/* --- 章节选择卡片切换 (Tabs) --- */}
      <div className="w-full max-w-md grid grid-cols-2 gap-2 mb-4 bg-amber-200/80 p-1.5 rounded-2xl border-2 border-amber-300">
        {CHAPTERS.map(ch => {
          const isSelected = selectedChapter === ch.id;
          const isCh1Done = [1, 2, 3, 4, 5, 6].every(id => completedLevels.includes(id));
          const isChUnlocked = ch.id === 1 || isCh1Done;

          return (
            <button
              key={ch.id}
              onClick={() => {
                if (isChUnlocked) {
                  sounds.playClick();
                  setSelectedChapter(ch.id as 1 | 2);
                }
              }}
              disabled={!isChUnlocked}
              className={`p-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-md'
                  : isChUnlocked
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <span>{ch.badge}</span>
              <span>第 {ch.id} 章</span>
              {!isChUnlocked && <Lock size={14} className="text-stone-400" />}
            </button>
          );
        })}
      </div>

      {/* --- 当前章节信息与进度横幅 --- */}
      <div className="w-full max-w-md bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 rounded-2xl p-3 border-2 border-amber-300 shadow-sm mb-4 text-center">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm sm:text-base font-black text-amber-950 flex items-center gap-1">
            <span>{currentChapterInfo.badge}</span>
            <span>{currentChapterInfo.title}</span>
          </h3>
          <div className="flex items-center gap-1 text-xs font-black text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-full">
            <Trophy size={14} className="text-amber-700" />
            <span>
              {chapterCompletedCount} / {currentChapterLevels.length} 关
            </span>
          </div>
        </div>
        <p className="text-xs text-amber-800 text-left font-medium">
          {currentChapterInfo.desc}
        </p>

        {/* 进度条 */}
        <div className="w-full h-2.5 bg-amber-200 rounded-full overflow-hidden mt-2.5 border border-amber-300">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
            style={{
              width: `${(chapterCompletedCount / currentChapterLevels.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* --- 关卡列表路线图 --- */}
      <div className="w-full flex flex-col gap-3.5 items-center">
        {currentChapterLevels.map((lvl, index) => {
          const isCompleted = completedLevels.includes(lvl.id);
          // 只要上一关已完成，或者第一关，就处于解锁状态
          const isUnlocked = lvl.id === 1 || completedLevels.includes(lvl.id - 1);
          const isCurrentTarget = isUnlocked && !isCompleted;

          return (
            <div key={lvl.id} className="relative w-full max-w-md flex items-center justify-center">
              {/* 路线虚线 */}
              {index < currentChapterLevels.length - 1 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-4 bg-amber-300 border-dashed border-l-2 border-amber-400 -z-0" />
              )}

              <button
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    sounds.playClick();
                    onSelectLevel(lvl.id);
                  }
                }}
                className={`relative w-full p-3.5 rounded-3xl border-4 transition-all duration-200 flex items-center gap-3.5 ${
                  isCurrentTarget
                    ? 'bg-gradient-to-r from-amber-200 to-orange-200 border-amber-400 shadow-xl scale-102 animate-gentle'
                    : isCompleted
                    ? 'bg-emerald-100 hover:bg-emerald-200 border-emerald-400 shadow-md'
                    : 'bg-stone-200 border-stone-300 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* 关卡徽章大图标 */}
                <div
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl border-2 shadow-inner shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-300 border-white text-emerald-950'
                      : isCurrentTarget
                      ? 'bg-amber-300 border-white animate-pulse'
                      : 'bg-stone-300 border-stone-200 text-stone-500'
                  }`}
                >
                  {isUnlocked ? lvl.badge : <Lock size={22} className="text-stone-500" />}
                </div>

                {/* 关卡文字详情 */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-white/70 text-amber-900">
                      第 {lvl.id} 关
                    </span>
                    <span className="font-black text-base sm:text-lg text-amber-950">
                      {lvl.title}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/80 font-medium mt-0.5 line-clamp-1">
                    {lvl.goal}
                  </p>
                </div>

                {/* 状态标示（已完成亮星星 / 未完成等待挑战） */}
                <div className="shrink-0 flex items-center gap-1">
                  {isCompleted ? (
                    <div className="flex gap-0.5 text-amber-500">
                      <Star size={18} fill="#f59e0b" />
                      <Star size={18} fill="#f59e0b" />
                      <Star size={18} fill="#f59e0b" />
                    </div>
                  ) : isCurrentTarget ? (
                    <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg animate-bounce">
                      <Play size={16} fill="white" />
                    </div>
                  ) : null}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
