import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { EnergyGauge } from '@/components/EnergyGauge';
import { TaskList } from '@/components/TaskList';
import { TaskTimer } from '@/components/timer/TaskTimer';
import { TaskRing } from '@/components/visualization/TaskRing';
import { 
  Sparkles, 
  Gift, 
  Zap,
  X,
  CheckCircle2,
  Clock,
  Crown,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RandomEvent } from '@/types';

// 随机事件配置
const randomEventTemplates: Omit<RandomEvent, 'id' | 'expiresAt'>[] = [
  {
    type: 'lucky',
    title: '幸运任务',
    description: '完成这个额外任务，获得双倍积分！',
    points: 20,
  },
  {
    type: 'help',
    title: '助力请求',
    description: '帮助朋友完成一个任务，双方都能获得奖励！',
    points: 15,
  },
  {
    type: 'challenge',
    title: '限时挑战',
    description: '在30分钟内完成3个任务，解锁特殊成就！',
    points: 30,
  },
  {
    type: 'reward',
    title: '每日奖励',
    description: '恭喜！你获得了今日登录奖励！',
    points: 10,
  },
];

interface FloatingEventProps {
  event: RandomEvent;
  onComplete: () => void;
  onDismiss: () => void;
}

function FloatingEvent({ event, onComplete, onDismiss }: FloatingEventProps) {
  const getIcon = () => {
    switch (event.type) {
      case 'lucky': return Sparkles;
      case 'help': return Gift;
      case 'challenge': return Zap;
      case 'reward': return Gift;
    }
  };

  const getColor = () => {
    switch (event.type) {
      case 'lucky': return 'from-yellow-400/20 to-orange-400/20';
      case 'help': return 'from-blue-400/20 to-cyan-400/20';
      case 'challenge': return 'from-red-400/20 to-pink-400/20';
      case 'reward': return 'from-green-400/20 to-emerald-400/20';
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 50 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: 0,
      }}
      exit={{ scale: 0, opacity: 0, y: 50 }}
      transition={{ 
        scale: { type: 'spring', stiffness: 400, damping: 20 },
      }}
      className="fixed bottom-24 right-4 z-50 w-72"
    >
      <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${getColor()} backdrop-blur-xl border border-white/20 shadow-xl`}>
        {/* 关闭按钮 */}
        <button
          onClick={onDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
        
        {/* 图标 */}
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* 内容 */}
        <h3 className="text-center font-semibold text-white mb-1">{event.title}</h3>
        <p className="text-center text-sm text-white/80 mb-3">{event.description}</p>
        
        {/* 奖励 */}
        {event.points && (
          <div className="flex items-center justify-center gap-1 text-yellow-300 mb-3">
            <Sparkles className="w-4 h-4" />
            <span className="font-bold">+{event.points} 分</span>
          </div>
        )}
        
        {/* 按钮 */}
        <Button
          onClick={onComplete}
          size="sm"
          className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
        >
          <CheckCircle2 className="w-4 h-4 mr-1" />
          接受挑战
        </Button>
      </div>
    </motion.div>
  );
}

export function HomePage() {
  const { state, dispatch, isVip, getTrialDaysLeft } = useApp();
  const [floatingEvents, setFloatingEvents] = useState<RandomEvent[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);

  // 生成随机事件
  useEffect(() => {
    const checkAndGenerateEvent = () => {
      if (Math.random() < 0.3 && floatingEvents.length < 1) {
        const template = randomEventTemplates[Math.floor(Math.random() * randomEventTemplates.length)];
        const newEvent: RandomEvent = {
          ...template,
          id: Math.random().toString(36).substring(2, 9),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        };
        setFloatingEvents(prev => [...prev, newEvent]);
      }
    };

    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited) {
      setShowWelcome(true);
      sessionStorage.setItem('hasVisited', 'true');
    }

    const interval = setInterval(checkAndGenerateEvent, 60000);
    return () => clearInterval(interval);
  }, [floatingEvents.length]);

  const handleCompleteEvent = (eventId: string) => {
    const event = floatingEvents.find(e => e.id === eventId);
    if (event?.points) {
      dispatch({
        type: 'UPDATE_STATS',
        payload: { totalPoints: state.stats.totalPoints + event.points }
      });
    }
    setFloatingEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleDismissEvent = (eventId: string) => {
    setFloatingEvents(prev => prev.filter(e => e.id !== eventId));
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 欢迎弹窗 */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowWelcome(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-3xl p-6 max-w-sm w-full border border-border/50"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-4xl">
                  ⚡
                </div>
                <h2 className="text-xl font-bold mb-2">欢迎使用能量管理</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  根据你的每日能量状态，智能推荐适合的任务。状态好时挑战自我，状态差时轻松完成。
                </p>
                <div className="space-y-2 text-left text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-400/20 flex items-center justify-center text-red-400 text-xs">1</div>
                    <span>评估今日能量状态</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 text-xs">2</div>
                    <span>查看推荐任务列表</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center text-green-400 text-xs">3</div>
                    <span>完成任务获得积分</span>
                  </div>
                </div>
                <Button onClick={() => setShowWelcome(false)} className="w-full">
                  开始使用
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 浮动事件 - 固定在右下角 */}
      <AnimatePresence>
        {floatingEvents.map(event => (
          <FloatingEvent
            key={event.id}
            event={event}
            onComplete={() => handleCompleteEvent(event.id)}
            onDismiss={() => handleDismissEvent(event.id)}
          />
        ))}
      </AnimatePresence>

      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">能量管理</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            根据状态，智能规划
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* VIP 标识 */}
          {isVip() ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-400/20 text-yellow-400 text-xs">
              <Crown className="w-3 h-3" />
              <span>VIP</span>
            </div>
          ) : getTrialDaysLeft() > 0 ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs">
              <span>试用 {getTrialDaysLeft()} 天</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
              <Lock className="w-3 h-3" />
              <span>免费版</span>
            </div>
          )}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </motion.div>
        </div>
      </motion.div>

      {/* 能量仪表盘 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <EnergyGauge />
      </motion.div>

      {/* 快速统计 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-orange-400/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{state.stats.currentStreak}</p>
          <p className="text-xs text-muted-foreground">连续天数</p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-green-400/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {state.todayTasks.filter(t => t.completed).length}
          </p>
          <p className="text-xs text-muted-foreground">今日完成</p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-400/10 flex items-center justify-center">
            <Gift className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{state.stats.totalPoints}</p>
          <p className="text-xs text-muted-foreground">总积分</p>
        </div>
      </motion.div>

      {/* 计时器（如果有活跃任务） */}
      {state.timer.isRunning && state.timer.currentTaskId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <TaskTimer
            taskId={state.timer.currentTaskId}
            taskTitle={state.timer.currentTaskTitle || ''}
            estimatedMinutes={30}
          />
        </motion.div>
      )}

      {/* 圆环可视化 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <TaskRing />
      </motion.div>

      {/* 任务列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <TaskList />
      </motion.div>
    </div>
  );
}
