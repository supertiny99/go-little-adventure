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

  // 检查棋盘是否全空（用于新手首步指引）
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

  // 计算星位（花位/天元）点
  const starPoints = React.useMemo(() => {
    const pts: Point[] = [];
    const center = Math.floor(size / 2);
    pts.push({ r: center, c: center }); // 天元中心点

    if (size === 9) {
      pts.push({ r: 2, c: 2 }, { r: 2, c: 6 }, { r: 6, c: 2 }, { r: 6, c: 6 });
    }
    return pts;
  }, [size]);

  const centerPoint = Math.floor(size / 2);

  return (
    <div className="relative p-5 sm:p-7 bg-amber-100 rounded-3xl shadow-2xl border-4 sm:border-8 border-amber-300 select-none max-w-[92vw] sm:max-w-[480px] mx-auto aspect-square flex flex-col justify-between">
      {/* 棋盘木纹微光泽 */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50/60 to-amber-200/40 pointer-events-none" />

      {/* 网格行与列 */}
      <div
        className="relative w-full h-full grid"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`,
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`;
            const stoneLiberties = stoneLibertiesMap.get(key);
            const isLast = lastMove?.r === r && lastMove?.c === c;
            const isHighlight = highlightPoints.some(p => p.r === r && p.c === c);
            const isLibertySpot = cell === null && allLibertiesSet.has(key);
            const isStar = starPoints.some(p => p.r === r && p.c === c);
            const isCenter = r === centerPoint && c === centerPoint;

            return (
              <div
                key={key}
                onClick={() => !disabled && onCellClick(r, c)}
                className={`group relative flex items-center justify-center cursor-pointer transition-all duration-150 ${
                  disabled ? 'cursor-not-allowed' : 'active:scale-95'
                }`}
              >
                {/* --- 棋盘十字线 --- */}
                {/* 水平线 */}
                <div
                  className={`absolute h-0.5 sm:h-1 bg-amber-900/60 pointer-events-none ${
                    c === 0 ? 'left-1/2 w-1/2' : c === size - 1 ? 'left-0 w-1/2' : 'left-0 w-full'
                  }`}
                />
                {/* 垂直线 */}
                <div
                  className={`absolute w-0.5 sm:w-1 bg-amber-900/60 pointer-events-none ${
                    r === 0 ? 'top-1/2 h-1/2' : r === size - 1 ? 'top-0 h-1/2' : 'top-0 h-full'
                  }`}
                />

                {/* 天元/星位小圆点 */}
                {isStar && !cell && (
                  <div className="absolute w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-900/80 pointer-events-none" />
                )}

                {/* --- 棋子呈现 --- */}
                {cell ? (
                  <div className="w-[84%] h-[84%] z-10 pointer-events-none">
                    <Piece
                      color={cell}
                      liberties={showLiberties ? stoneLiberties : undefined}
                      isLastMove={isLast}
                    />
                  </div>
                ) : (
                  /* 空位时的交互辅助与高亮 */
                  <>
                    {/* 呼吸口显示：透视眼镜模式 */}
                    {showLiberties && isLibertySpot && !isHighlight && (
                      <div className="z-10 flex items-center justify-center pointer-events-none">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-400 border-2 border-white shadow pulse-liberty opacity-90 flex items-center justify-center text-[10px]">
                          🌱
                        </div>
                      </div>
                    )}

                    {/* 开局首步：空盘中心指引 */}
                    {isEmptyBoard && isCenter && !disabled && (
                      <div className="z-20 flex flex-col items-center justify-center pointer-events-none animate-bounce">
                        <div className="text-xl sm:text-2xl">👆</div>
                        <div className="px-1.5 py-0.5 bg-amber-400 text-amber-950 font-black text-[10px] sm:text-xs rounded-full shadow-md whitespace-nowrap -mt-1">
                          点这下第一步
                        </div>
                      </div>
                    )}

                    {/* 提示落子发光目标点 */}
                    {isHighlight && (
                      <div className="z-20 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-4 border-amber-400 bg-amber-300/60 animate-ping absolute" />
                        <div className="text-xl sm:text-2xl animate-bounce">⭐</div>
                      </div>
                    )}

                    {/* 悬停时的半透明预览小棋子虚影（极佳儿童反馈） */}
                    {!disabled && (
                      <div className="w-[78%] h-[78%] opacity-0 group-hover:opacity-40 transition-opacity duration-150 pointer-events-none z-10">
                        <Piece color={hoverColor} />
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
