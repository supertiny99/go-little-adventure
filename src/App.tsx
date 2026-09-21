import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LevelSelect } from './components/LevelSelect';
import { LevelAdventure } from './components/LevelAdventure';
import { AiBattleView } from './components/AiBattleView';
import { LEVELS } from './data/levels';
import { sounds } from './utils/sound';
import { voice } from './utils/speech';

export function App() {
  const [currentTab, setCurrentTab] = useState<'adventure' | 'battle'>('adventure');
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);

  // 本地存储记录孩子通关进度
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('go_completed_levels');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);

  // 同步声音设置
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    sounds.playClick();
  };

  const handleToggleSpeech = () => {
    const next = !speechEnabled;
    setSpeechEnabled(next);
    voice.enabled = next;
    if (!next) voice.stop();
  };

  // 记录通关
  const handleLevelComplete = (id: number) => {
    if (!completedLevels.includes(id)) {
      const nextCompleted = [...completedLevels, id];
      setCompletedLevels(nextCompleted);
      try {
        localStorage.setItem('go_completed_levels', JSON.stringify(nextCompleted));
      } catch {
        // ignore
      }
    }
  };

  // 下一关
  const handleNextLevel = () => {
    if (activeLevelId === null) return;
    const nextId = activeLevelId + 1;
    if (LEVELS.some(l => l.id === nextId)) {
      setActiveLevelId(nextId);
    } else {
      setActiveLevelId(null); // 通关完全部关卡回到地图
    }
  };

  const currentLevel = LEVELS.find(l => l.id === activeLevelId);
  const totalStars = completedLevels.length * 3;

  return (
    <div className="min-h-screen bg-[#fefce8] text-slate-900 flex flex-col justify-between selection:bg-amber-300">
      {/* 顶部导航与状态栏 */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab === 'adventure') {
            // 切换回冒险模式时若无正在进行关卡，则显示地图
          }
        }}
        totalStars={totalStars}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        speechEnabled={speechEnabled}
        onToggleSpeech={handleToggleSpeech}
      />

      {/* 主界面内容 */}
      <main className="flex-1 flex flex-col justify-center items-center py-2 sm:py-4">
        {currentTab === 'adventure' ? (
          activeLevelId && currentLevel ? (
            <LevelAdventure
              level={currentLevel}
              onBackToMap={() => setActiveLevelId(null)}
              onLevelComplete={handleLevelComplete}
              onNextLevel={handleNextLevel}
              hasNextLevel={LEVELS.some(l => l.id === activeLevelId + 1)}
            />
          ) : (
            <LevelSelect
              levels={LEVELS}
              completedLevels={completedLevels}
              onSelectLevel={(id) => setActiveLevelId(id)}
            />
          )
        ) : (
          <AiBattleView />
        )}
      </main>

      {/* 底部护眼温馨提示 */}
      <footer className="py-2.5 px-4 text-center text-xs text-amber-800/80 font-bold bg-amber-100/60 border-t border-amber-200">
        🌱 温馨提示：每次下棋建议控制在 15 分钟以内，多眺望远方绿树，保护明亮的大眼睛哦！
      </footer>
    </div>
  );
}

export default App;
