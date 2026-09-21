import React from 'react';
import type { Level } from '../data/levels';
import { sounds } from '../utils/sound';
import { Lock, Star, Play } from 'lucide-react';

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
  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 flex flex-col items-center">
      {/* 标题横幅 */}
      <div className="mb-6 text-center">
        <div className="inline-block px-5 py-2 bg-amber-200 border-2 border-amber-400 rounded-full shadow-sm text-amber-900 font-black text-lg sm:text-xl mb-2">
          🗺️ 围棋冒险大地图
        </div>
        <p className="text-amber-800 text-sm sm:text-base font-medium">
          点击小岛，跟着小黑猫一起闯关学围棋吧！
        </p>
      </div>

      {/* 关卡列表路线图 */}
      <div className="w-full flex flex-col gap-4 items-center">
        {levels.map((lvl, index) => {
          const isCompleted = completedLevels.includes(lvl.id);
          // 只要上一关已完成，或者第一关，就处于解锁状态
          const isUnlocked = lvl.id === 1 || completedLevels.includes(lvl.id - 1);
          const isCurrentTarget = isUnlocked && !isCompleted;

          return (
            <div key={lvl.id} className="relative w-full max-w-md flex items-center justify-center">
              {/* 路线虚线 */}
              {index < levels.length - 1 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-6 bg-amber-300 border-dashed border-l-2 border-amber-400 -z-0" />
              )}

              <button
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    sounds.playClick();
                    onSelectLevel(lvl.id);
                  }
                }}
                className={`relative w-full p-4 rounded-3xl border-4 transition-all duration-200 flex items-center gap-4 ${
                  isCurrentTarget
                    ? 'bg-gradient-to-r from-amber-200 to-orange-200 border-amber-400 shadow-xl scale-105 animate-gentle'
                    : isCompleted
                    ? 'bg-emerald-100 hover:bg-emerald-200 border-emerald-400 shadow-md'
                    : 'bg-stone-200 border-stone-300 opacity-65 cursor-not-allowed'
                }`}
              >
                {/* 关卡徽章大图标 */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl border-2 shadow-inner shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-300 border-white text-emerald-950'
                      : isCurrentTarget
                      ? 'bg-amber-300 border-white animate-pulse'
                      : 'bg-stone-300 border-stone-200 text-stone-500'
                  }`}
                >
                  {isUnlocked ? lvl.badge : <Lock size={26} className="text-stone-500" />}
                </div>

                {/* 关卡文字详情 */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm px-2 py-0.5 rounded-full bg-white/70 text-amber-900">
                      第 {lvl.id} 关
                    </span>
                    <span className="font-black text-lg sm:text-xl text-amber-950">
                      {lvl.title}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-900/80 font-medium mt-1 line-clamp-1">
                    {lvl.goal}
                  </p>
                </div>

                {/* 状态标示（已完成亮星星 / 未完成等待挑战） */}
                <div className="shrink-0 flex items-center gap-1">
                  {isCompleted ? (
                    <div className="flex gap-0.5 text-amber-500">
                      <Star size={20} fill="#f59e0b" />
                      <Star size={20} fill="#f59e0b" />
                      <Star size={20} fill="#f59e0b" />
                    </div>
                  ) : isCurrentTarget ? (
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg animate-bounce">
                      <Play size={18} fill="white" />
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
