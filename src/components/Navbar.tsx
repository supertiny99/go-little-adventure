import React from 'react';
import { sounds } from '../utils/sound';
import { Volume2, VolumeX, Mic, MicOff, Star, Compass, Swords } from 'lucide-react';

interface NavbarProps {
  currentTab: 'adventure' | 'battle';
  onTabChange: (tab: 'adventure' | 'battle') => void;
  totalStars: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  speechEnabled: boolean;
  onToggleSpeech: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  totalStars,
  soundEnabled,
  onToggleSound,
  speechEnabled,
  onToggleSpeech,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-amber-200/95 backdrop-blur border-b-4 border-amber-300 shadow-md py-2.5 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* 左侧：可爱 Logo */}
        <div className="flex items-center gap-2">
          <div className="text-2xl sm:text-3xl animate-bounce">🐱</div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-amber-950 tracking-wide flex items-center gap-1">
              围棋小萌主
            </h1>
            <span className="hidden sm:inline-block text-[11px] font-bold text-amber-800">
              5岁儿童围棋启蒙乐园
            </span>
          </div>
        </div>

        {/* 中间：主模式切换按钮 */}
        <div className="flex items-center bg-amber-300/80 p-1 rounded-2xl border-2 border-amber-400">
          <button
            onClick={() => {
              sounds.playClick();
              onTabChange('adventure');
            }}
            className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              currentTab === 'adventure'
                ? 'bg-amber-500 text-white shadow'
                : 'text-amber-900 hover:bg-amber-200/60'
            }`}
          >
            <Compass size={16} />
            闯关冒险
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onTabChange('battle');
            }}
            className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              currentTab === 'battle'
                ? 'bg-orange-500 text-white shadow'
                : 'text-amber-900 hover:bg-amber-200/60'
            }`}
          >
            <Swords size={16} />
            萌宠下棋
          </button>
        </div>

        {/* 右侧：星星成就 & 声音/语音开关 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 星星收集器 */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 rounded-full border-2 border-amber-300 text-amber-900 font-black text-xs sm:text-sm shadow-inner">
            <Star size={16} className="text-amber-500 fill-amber-400 animate-spin-slow" />
            <span>{totalStars}</span>
          </div>

          {/* 音效开关 */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border-2 transition-all ${
              soundEnabled
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-stone-200 border-stone-300 text-stone-500'
            }`}
            title={soundEnabled ? '音效已开' : '音效已关'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* 语音讲解开关 */}
          <button
            onClick={onToggleSpeech}
            className={`p-2 rounded-xl border-2 transition-all ${
              speechEnabled
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-stone-200 border-stone-300 text-stone-500'
            }`}
            title={speechEnabled ? '语音讲解已开' : '语音已关'}
          >
            {speechEnabled ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
