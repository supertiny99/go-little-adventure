import React from 'react';
import type { StoneColor } from '../engine/goLogic';

interface PieceProps {
  color: StoneColor;
  liberties?: number; // 剩余气数
  isLastMove?: boolean; // 是否是刚下的最新一步
}

export const Piece: React.FC<PieceProps> = ({
  color,
  liberties,
  isLastMove = false,
}) => {
  const isDanger = liberties === 1;

  if (color === 'black') {
    // 傲娇黑小猫
    return (
      <div
        className={`relative w-full h-full flex items-center justify-center select-none transition-transform duration-300 ${
          isDanger ? 'animate-danger scale-95' : 'hover:scale-105'
        }`}
      >
        {/* 最新落子金色光圈 */}
        {isLastMove && (
          <div className="absolute inset-0 rounded-full border-4 border-amber-400 animate-ping opacity-75 pointer-events-none" />
        )}

        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* 猫耳朵 */}
          <polygon points="15,40 25,8 45,28" fill="#1e293b" />
          <polygon points="20,35 28,15 40,28" fill="#f43f5e" opacity="0.8" />
          <polygon points="85,40 75,8 55,28" fill="#1e293b" />
          <polygon points="80,35 72,15 60,28" fill="#f43f5e" opacity="0.8" />

          {/* 猫脸主体 */}
          <circle cx="50" cy="54" r="42" fill="#1e293b" />
          {/* 肚皮/光泽微高光 */}
          <ellipse cx="50" cy="24" rx="20" ry="8" fill="#334155" opacity="0.4" />

          {/* 眼睛 */}
          {isDanger ? (
            // 慌张出汗大眼睛
            <>
              <circle cx="34" cy="50" r="10" fill="#facc15" />
              <circle cx="34" cy="50" r="4" fill="#0f172a" />
              <circle cx="66" cy="50" r="10" fill="#facc15" />
              <circle cx="66" cy="50" r="4" fill="#0f172a" />
              {/* 汗珠 */}
              <path
                d="M78 30 C78 26, 85 20, 85 20 C85 20, 92 26, 92 30 C92 34, 88 38, 85 38 C82 38, 78 34, 78 30 Z"
                fill="#38bdf8"
                className="animate-bounce"
              />
            </>
          ) : (
            // 活泼大萌眼
            <>
              <circle cx="35" cy="50" r="8" fill="#ffffff" />
              <circle cx="36" cy="50" r="5" fill="#0f172a" />
              <circle cx="38" cy="48" r="2" fill="#ffffff" />

              <circle cx="65" cy="50" r="8" fill="#ffffff" />
              <circle cx="66" cy="50" r="5" fill="#0f172a" />
              <circle cx="68" cy="48" r="2" fill="#ffffff" />
            </>
          )}

          {/* 萌萌鼻子与三瓣嘴 */}
          <polygon points="50,58 46,55 54,55" fill="#fb7185" />
          <path
            d="M44 63 Q50 67 50 61 Q50 67 56 63"
            stroke="#fb7185"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* 粉红腮红 */}
          <ellipse cx="24" cy="59" rx="6" ry="3.5" fill="#f43f5e" opacity="0.6" />
          <ellipse cx="76" cy="59" rx="6" ry="3.5" fill="#f43f5e" opacity="0.6" />

          {/* 胡须 */}
          <line x1="12" y1="52" x2="26" y2="54" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="60" x2="26" y2="58" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <line x1="88" y1="52" x2="74" y2="54" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <line x1="88" y1="60" x2="74" y2="58" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* 气数小气泡标牌 */}
        {typeof liberties === 'number' && (
          <div
            className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shadow-md border-2 border-white ${
              isDanger ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white'
            }`}
          >
            {liberties}
          </div>
        )}
      </div>
    );
  }

  // 呆萌白小兔
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center select-none transition-transform duration-300 ${
        isDanger ? 'animate-danger scale-95' : 'hover:scale-105'
      }`}
    >
      {isLastMove && (
        <div className="absolute inset-0 rounded-full border-4 border-amber-400 animate-ping opacity-75 pointer-events-none" />
      )}

      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* 长长兔耳朵 */}
        <ellipse
          cx="32"
          cy="18"
          rx="9"
          ry="20"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="2"
          transform={isDanger ? 'rotate(-15 32 18)' : 'rotate(-5 32 18)'}
        />
        <ellipse
          cx="32"
          cy="18"
          rx="5"
          ry="14"
          fill="#f472b6"
          opacity="0.6"
          transform={isDanger ? 'rotate(-15 32 18)' : 'rotate(-5 32 18)'}
        />

        <ellipse
          cx="68"
          cy="18"
          rx="9"
          ry="20"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="2"
          transform={isDanger ? 'rotate(15 68 18)' : 'rotate(5 68 18)'}
        />
        <ellipse
          cx="68"
          cy="18"
          rx="5"
          ry="14"
          fill="#f472b6"
          opacity="0.6"
          transform={isDanger ? 'rotate(15 68 18)' : 'rotate(5 68 18)'}
        />

        {/* 兔头主体 */}
        <circle cx="50" cy="56" r="40" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2.5" />

        {/* 眼睛 */}
        {isDanger ? (
          // 惊吓波浪眼
          <>
            <circle cx="34" cy="52" r="7" fill="#ef4444" />
            <circle cx="35" cy="51" r="3" fill="#ffffff" />
            <circle cx="66" cy="52" r="7" fill="#ef4444" />
            <circle cx="67" cy="51" r="3" fill="#ffffff" />
            {/* 蓝色小泪滴 */}
            <path
              d="M76 46 C76 42, 82 36, 82 36 C82 36, 88 42, 88 46 C88 50, 85 52, 82 52 C79 52, 76 50, 76 46 Z"
              fill="#60a5fa"
              className="animate-bounce"
            />
          </>
        ) : (
          // 晶亮红宝石小兔眼
          <>
            <circle cx="36" cy="52" r="6" fill="#fb7185" />
            <circle cx="38" cy="50" r="2.5" fill="#ffffff" />
            <circle cx="64" cy="52" r="6" fill="#fb7185" />
            <circle cx="66" cy="50" r="2.5" fill="#ffffff" />
          </>
        )}

        {/* 粉嫩兔鼻与小嘴 */}
        <circle cx="50" cy="61" r="4" fill="#f43f5e" />
        <path
          d="M45 66 Q50 71 50 66 Q50 71 55 66"
          stroke="#f43f5e"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* 腮红 */}
        <ellipse cx="26" cy="62" rx="7" ry="4" fill="#fbcfe8" />
        <ellipse cx="74" cy="62" rx="7" ry="4" fill="#fbcfe8" />
      </svg>

      {/* 气数小气泡标牌 */}
      {typeof liberties === 'number' && (
        <div
          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shadow-md border-2 border-white ${
            isDanger ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white'
          }`}
        >
          {liberties}
        </div>
      )}
    </div>
  );
};
