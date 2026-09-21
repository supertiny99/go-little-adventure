import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/sound';
import { voice } from '../utils/speech';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onNext?: () => void;
  onRetry: () => void;
  hasNextLevel: boolean;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  title = '太棒啦！大获全胜！',
  message = '你真是一只聪明的小黑猫！',
  onNext,
  onRetry,
  hasNextLevel,
}) => {
  useEffect(() => {
    if (isOpen) {
      sounds.playVictory();
      voice.speak(message);

      // 五彩纸屑喷洒特效
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
      });
    }
  }, [isOpen, message]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 sm:border-6 border-amber-400 text-center flex flex-col items-center">
        {/* 顶部三颗闪烁大星星 */}
        <div className="flex gap-2 -mt-12 sm:-mt-14 mb-3">
          <div className="text-4xl sm:text-5xl animate-bounce drop-shadow" style={{ animationDelay: '0ms' }}>⭐</div>
          <div className="text-5xl sm:text-6xl animate-bounce drop-shadow -translate-y-2" style={{ animationDelay: '150ms' }}>⭐</div>
          <div className="text-4xl sm:text-5xl animate-bounce drop-shadow" style={{ animationDelay: '300ms' }}>⭐</div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-amber-900 mb-2 flex items-center gap-2">
          <Sparkles className="text-amber-500 fill-amber-400" />
          {title}
        </h3>

        <p className="text-base sm:text-lg text-amber-800/90 font-medium mb-6 px-4">
          {message}
        </p>

        {/* 按钮群 */}
        <div className="flex gap-3 w-full justify-center">
          <button
            onClick={() => {
              sounds.playClick();
              onRetry();
            }}
            className="flex-1 py-3 sm:py-4 px-4 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-base sm:text-lg shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={20} />
            再玩一次
          </button>

          {hasNextLevel && onNext && (
            <button
              onClick={() => {
                sounds.playClick();
                onNext();
              }}
              className="flex-[1.4] py-3 sm:py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-lg sm:text-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              下一关
              <ArrowRight size={22} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
