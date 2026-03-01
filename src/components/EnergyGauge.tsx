import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import type { EnergyLevel } from '@/types';
import { Battery, BatteryLow, BatteryMedium, BatteryFull, BatteryWarning } from 'lucide-react';

const energyLabels: Record<EnergyLevel, { label: string; emoji: string; color: string; description: string }> = {
  1: { label: '疲惫', emoji: '😴', color: '#FF6B6B', description: '需要休息，只做基础任务' },
  2: { label: '低迷', emoji: '😔', color: '#FF8E8E', description: '状态不佳，轻松完成' },
  3: { label: '一般', emoji: '😐', color: '#FFD93D', description: '正常状态，常规任务' },
  4: { label: '良好', emoji: '🙂', color: '#A8E6CF', description: '感觉不错，可以挑战' },
  5: { label: '充沛', emoji: '⚡', color: '#00D26A', description: '能量满满，全力以赴' },
};

export function EnergyGauge() {
  const { state, setEnergy, getTodayPoints, getTargetPoints } = useApp();
  const [showParticles, setShowParticles] = useState(false);
  
  const currentEnergy = state.currentEnergy;
  const energyInfo = energyLabels[currentEnergy];
  const todayPoints = getTodayPoints();
  const targetPoints = getTargetPoints();
  const progress = Math.min((todayPoints / targetPoints) * 100, 100);

  const handleEnergyChange = (level: EnergyLevel) => {
    setEnergy(level);
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 500);
  };

  const getBatteryIcon = () => {
    switch (currentEnergy) {
      case 1: return BatteryWarning;
      case 2: return BatteryLow;
      case 3: return BatteryMedium;
      case 4: return Battery;
      case 5: return BatteryFull;
    }
  };

  const BatteryIcon = getBatteryIcon();

  return (
    <div className="relative">
      {/* 背景光晕效果 */}
      <motion.div
        className="absolute inset-0 rounded-3xl blur-3xl opacity-20"
        animate={{
          background: `radial-gradient(circle at 50% 50%, ${energyInfo.color}, transparent 70%)`,
        }}
        transition={{ duration: 0.5 }}
      />
      
      <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl p-6 border border-border/50">
        {/* 标题区域 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">今日能量</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
            <BatteryIcon className="w-4 h-4" style={{ color: energyInfo.color }} />
            <span className="text-sm font-medium" style={{ color: energyInfo.color }}>
              {energyInfo.label}
            </span>
          </div>
        </div>

        {/* 能量选择器 */}
        <div className="relative mb-8">
          {/* 能量滑块轨道 */}
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={false}
              animate={{
                width: `${(currentEnergy / 5) * 100}%`,
                backgroundColor: energyInfo.color,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
          
          {/* 能量级别按钮 */}
          <div className="flex justify-between mt-4">
            {[1, 2, 3, 4, 5].map((level) => {
              const isActive = currentEnergy === level;
              const levelInfo = energyLabels[level as EnergyLevel];
              
              return (
                <motion.button
                  key={level}
                  onClick={() => handleEnergyChange(level as EnergyLevel)}
                  className={`relative flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${
                    isActive ? 'scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                  whileHover={{ scale: isActive ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* 选中指示器 */}
                  {isActive && (
                    <motion.div
                      layoutId="energyIndicator"
                      className="absolute inset-0 rounded-xl"
                      style={{ backgroundColor: `${levelInfo.color}20` }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  {/* 能量数字 */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                      isActive ? 'shadow-lg' : ''
                    }`}
                    style={{
                      backgroundColor: isActive ? levelInfo.color : 'transparent',
                      color: isActive ? '#000' : levelInfo.color,
                      boxShadow: isActive ? `0 0 20px ${levelInfo.color}50` : 'none',
                    }}
                  >
                    {level}
                  </div>
                  
                  {/* 表情 */}
                  <span className="relative z-10 text-lg">{levelInfo.emoji}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 当前状态描述 */}
        <motion.div
          key={currentEnergy}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center mb-6"
        >
          <p className="text-sm text-muted-foreground">{energyInfo.description}</p>
        </motion.div>

        {/* 今日进度 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">今日进度</span>
            <span className="font-medium">
              <span className="text-primary">{todayPoints}</span>
              <span className="text-muted-foreground"> / {targetPoints} 分</span>
            </span>
          </div>
          
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>废铁II</span>
            <span>废铁I</span>
          </div>
        </div>

        {/* 粒子效果 */}
        <AnimatePresence>
          {showParticles && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: energyInfo.color,
                    left: `${50 + (Math.random() - 0.5) * 60}%`,
                    top: '50%',
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0],
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 200,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
