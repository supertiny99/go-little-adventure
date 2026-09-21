import React, { useEffect } from 'react';
import type { Level } from '../data/levels';
import { voice } from '../utils/speech';
import { sounds } from '../utils/sound';
import { Volume2, Play, Target } from 'lucide-react';

interface LessonModalProps {
  level: Level;
  isOpen: boolean;
  onStart: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({ level, isOpen, onStart }) => {
  useEffect(() => {
    if (isOpen) {
      // 开启关卡时自动播放语音讲解
      const timer = setTimeout(() => {
        voice.speak(level.voiceText);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, level]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 sm:border-6 border-amber-400 text-center flex flex-col items-center">
        {/* 顶部萌宠徽章 */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-300 border-4 border-white shadow-lg flex items-center justify-center text-4xl sm:text-5xl -mt-12 sm:-mt-14 mb-3">
          {level.badge}
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm mb-2">
          第 {level.id} 关
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-amber-900 mb-3">
          {level.title}
        </h3>

        {/* 故事情景框 */}
        <div className="w-full bg-white/80 rounded-2xl p-4 border-2 border-amber-200 shadow-inner mb-4 text-left">
          <p className="text-base sm:text-lg text-amber-950 leading-relaxed font-medium">
            {level.story}
          </p>
        </div>

        {/* 本关目标 */}
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm sm:text-base mb-6 bg-amber-100/80 px-3 py-2 rounded-xl w-full justify-center">
          <Target className="text-amber-600 shrink-0" size={18} />
          <span>目标：{level.goal}</span>
        </div>

        {/* 按钮区域 */}
        <div className="flex gap-3 w-full justify-center">
          <button
            onClick={() => {
              sounds.playClick();
              voice.speak(level.voiceText);
            }}
            className="py-3 px-4 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-sm sm:text-base shadow active:scale-95 transition-all flex items-center justify-center gap-1.5"
            title="再听一遍语音讲解"
          >
            <Volume2 size={20} />
            听讲解
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              voice.stop();
              onStart();
            }}
            className="flex-1 py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-lg sm:text-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play size={22} fill="white" />
            开始挑战！
          </button>
        </div>
      </div>
    </div>
  );
};
