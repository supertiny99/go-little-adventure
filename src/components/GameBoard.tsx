import React from 'react';
import { type BoardState, type Point, getAllGroups } from '../engine/goLogic';
import { Piece } from './Piece';

interface GameBoardProps {
  board: BoardState;
  onCellClick: (r: number, c: number) => void;
  lastMove?: Point | null;
  highlightPoints?: Point[]; // 提示高亮的目标点
  showLiberties?: boolean; // “透视眼镜”呼吸口全显示
  disabled?: boolean;
  hoverColor?: 'black' | 'white';
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  onCellClick,
  lastMove,
  highlightPoints = [],
  showLiberties = true,
  disabled = false,
  hoverColor = 'black',
}) => {
  const size = board.length;

  // 检查棋盘是否全空（用于开局首步指引）
  const isEmptyBoard = React.useMemo(() => {
    return board.every(row => row.every(cell => cell === null));
  }, [board]);

  // 计算盘上每个棋子所属块的气数，以及所有气的坐标集合
  const groups = getAllGroups(board);
  const stoneLibertiesMap = new Map<string, number>();
  const allLibertiesSet = new Set<string>();

  for (const group of groups) {
    for (const stone of group.stones) {
      stoneLibertiesMap.set(`${stone.r},${stone.c}`, group.liberties.length);
    }
    for (const lib of group.liberties) {
      allLibertiesSet.add(`${lib.r},${lib.c}`);
    }
  }

  // 规范计算星位坐标
  const starPoints = React.useMemo(() => {
    const pts: Point[] = [];
    const center = Math.floor(size / 2);
    pts.push({ r: center, c: center }); // 天元

    if (size === 7) {
      // 7路星位
      pts.push({ r: 2, c: 2 }, { r: 2, c: 4 }, { r: 4, c: 2 }, { r: 4, c: 4 });
    } else if (size === 9) {
      // 9路星位
      pts.push({ r: 2, c: 2 }, { r: 2, c: 6 }, { r: 6, c: 2 }, { r: 6, c: 6 });
    }
    return pts;
  }, [size]);

  const centerPoint = Math.floor(size / 2);

  // SVG 坐标基准：1000 x 1000
  const VB_SIZE = 1000;
  const step = VB_SIZE / size;
  const lineStart = step * 0.5;
  const lineEnd = VB_SIZE - step * 0.5;
  const lineWidth = size >= 9 ? 6 : size >= 7 ? 8 : 10;
  const starRadius = size >= 9 ? 12 : size >= 7 ? 15 : 18;

  return (
    <div className="relative p-3 sm:p-5 bg-gradient-to-br from-amber-100 via-amber-200 to-amber-100 rounded-3xl shadow-2xl border-4 sm:border-8 border-amber-400 select-none w-full max-w-[92vw] sm:max-w-[460px] mx-auto aspect-square flex items-center justify-center">
      {/* 内部高精度正方形工作区 */}
      <div className="relative w-full h-full">
        {/* --- 底层：SVG 完美精准网格线与星位 --- */}
        <svg
          viewBox={`0 0 ${VB_SIZE} ${VB_SIZE}`}
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm"
        >
          {/* 水平线条 */}
          {Array.from({ length: size }).map((_, i) => {
            const y = (i + 0.5) * step;
            return (
              <line
                key={`h-${i}`}
                x1={lineStart}
                y1={y}
                x2={lineEnd}
                y2={y}
                stroke="#78350f"
                strokeWidth={lineWidth}
                strokeLinecap="round"
                opacity={0.75}
              />
            );
          })}

          {/* 垂直线条 */}
          {Array.from({ length: size }).map((_, i) => {
            const x = (i + 0.5) * step;
            return (
              <line
                key={`v-${i}`}
                x1={x}
                y1={lineStart}
                x2={x}
                y2={lineEnd}
                stroke="#78350f"
                strokeWidth={lineWidth}
                strokeLinecap="round"
                opacity={0.75}
              />
            );
          })}

          {/* 星位圆点 */}
          {starPoints.map(pt => {
            const cx = (pt.c + 0.5) * step;
            const cy = (pt.r + 0.5) * step;
            return (
              <circle
                key={`star-${pt.r}-${pt.c}`}
                cx={cx}
                cy={cy}
                r={starRadius}
                fill="#78350f"
                opacity={0.85}
              />
            );
          })}
        </svg>

        {/* --- 上层：交叉点交互与棋子绝对定位层（绝对重叠居中，彻底消除任何位置漂移） --- */}
        {board.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`;
            const stoneLiberties = stoneLibertiesMap.get(key);
            const isLast = lastMove?.r === r && lastMove?.c === c;
            const isHighlight = highlightPoints.some(p => p.r === r && p.c === c);
            const isLibertySpot = cell === null && allLibertiesSet.has(key);
            const isCenter = r === centerPoint && c === centerPoint;

            // 百分比精准居中
            const leftPercent = ((c + 0.5) / size) * 100;
            const topPercent = ((r + 0.5) / size) * 100;
            const cellPercent = 100 / size;

            return (
              <div
                key={key}
                onClick={() => !disabled && onCellClick(r, c)}
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  width: `${cellPercent}%`,
                  height: `${cellPercent}%`,
                }}
                className={`group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-100 ${
                  disabled ? 'cursor-not-allowed' : 'active:scale-95'
                }`}
              >
                {/* 棋子层（绝对充满且居中） */}
                {cell ? (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="w-[88%] h-[88%]">
                      <Piece
                        color={cell}
                        liberties={showLiberties ? stoneLiberties : undefined}
                        isLastMove={isLast}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 呼吸口小绿芽（绝对居中，绝不与其他元素并排挤占位置） */}
                    {showLiberties && isLibertySpot && !isHighlight && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div
                          className={`rounded-full bg-emerald-400 border-2 border-white shadow-md pulse-liberty flex items-center justify-center ${
                            size >= 9 ? 'w-3 h-3 text-[9px]' : size >= 7 ? 'w-4 h-4 text-[10px]' : 'w-5 h-5 text-xs'
                          }`}
                        >
                          🌱
                        </div>
                      </div>
                    )}

                    {/* 推荐落子提示发光星（绝对居中） */}
                    {isHighlight && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <div className="w-8 h-8 rounded-full border-4 border-amber-400 bg-amber-300/60 animate-ping absolute" />
                        <div className={`${size >= 9 ? 'text-lg' : 'text-2xl'} animate-bounce`}>⭐</div>
                      </div>
                    )}

                    {/* 开局首步：天元手势指引（绝对居中上浮） */}
                    {isEmptyBoard && isCenter && !disabled && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 animate-bounce -translate-y-1">
                        <span className={size >= 9 ? 'text-base' : 'text-xl sm:text-2xl'}>👆</span>
                        <span
                          className={`bg-amber-400 text-amber-950 font-black rounded-full shadow-md whitespace-nowrap -mt-1 px-1.5 py-0.5 ${
                            size >= 9 ? 'text-[9px]' : 'text-[11px]'
                          }`}
                        >
                          点这下
                        </span>
                      </div>
                    )}

                    {/* 鼠标悬停半透明虚影（绝对充满居中，不占物理流空间） */}
                    {!disabled && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="w-[84%] h-[84%] opacity-0 group-hover:opacity-40 transition-opacity duration-150">
                          <Piece color={hoverColor} />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
