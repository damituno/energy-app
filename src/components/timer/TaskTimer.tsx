import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Square,
  Volume2,
  VolumeX
} from 'lucide-react';

interface TaskTimerProps {
  taskId: string;
  taskTitle: string;
  estimatedMinutes: number;
  onComplete?: () => void;
}

export function TaskTimer({ taskId, taskTitle, estimatedMinutes, onComplete }: TaskTimerProps) {
  const { state, startTimer, pauseTimer, resumeTimer, stopTimer, getTimerDuration } = useApp();
  const { timer, settings } = state;
  const [displayTime, setDisplayTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);

  // 更新显示时间
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (timer.isRunning) {
      interval = setInterval(() => {
        setDisplayTime(getTimerDuration());
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timer.isRunning, timer.startTime, timer.pausedTime, getTimerDuration]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.min((displayTime / (estimatedMinutes * 60)) * 100, 100);
  const isOverdue = displayTime > estimatedMinutes * 60;

  const handleStart = () => {
    startTimer(taskId, taskTitle);
  };

  const handlePause = () => {
    pauseTimer();
  };

  const handleResume = () => {
    resumeTimer();
  };

  const handleStop = () => {
    stopTimer();
    onComplete?.();
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 border border-border/50">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">{taskTitle}</h3>
          <p className="text-sm text-muted-foreground">
            预计 {estimatedMinutes} 分钟
          </p>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-muted-foreground" />
          ) : (
            <VolumeX className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* 计时器显示 */}
      <div className="relative mb-8">
        {/* 进度环 */}
        <div className="relative w-48 h-48 mx-auto">
          {/* 背景圆环 */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
            />
            {/* 进度圆环 */}
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke={isOverdue ? '#FF6B6B' : 'hsl(var(--primary))'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              initial={{ strokeDashoffset: `${2 * Math.PI * 88}` }}
              animate={{ strokeDashoffset: `${2 * Math.PI * 88 * (1 - progress / 100)}` }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          
          {/* 时间显示 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={displayTime}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`text-4xl font-bold font-mono ${
                isOverdue ? 'text-red-400' : 'text-foreground'
              }`}
            >
              {formatTime(displayTime)}
            </motion.span>
            <span className="text-sm text-muted-foreground mt-1">
              {timer.isPaused ? '已暂停' : timer.isRunning ? '进行中' : '准备开始'}
            </span>
          </div>
        </div>

        {/* 进度百分比 */}
        <div className="text-center mt-2">
          <span className={`text-sm ${isOverdue ? 'text-red-400' : 'text-muted-foreground'}`}>
            {Math.round(progress)}% {isOverdue ? '(已超时)' : ''}
          </span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-center gap-4">
        <AnimatePresence mode="wait">
          {!timer.isRunning ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                onClick={handleStart}
                size="lg"
                className="w-20 h-20 rounded-full"
              >
                <Play className="w-8 h-8 ml-1" />
              </Button>
            </motion.div>
          ) : timer.isPaused ? (
            <motion.div
              key="paused"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex gap-4"
            >
              <Button
                onClick={handleResume}
                size="lg"
                className="w-16 h-16 rounded-full"
              >
                <Play className="w-6 h-6 ml-1" />
              </Button>
              <Button
                onClick={handleStop}
                variant="destructive"
                size="lg"
                className="w-16 h-16 rounded-full"
              >
                <Square className="w-6 h-6" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="running"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex gap-4"
            >
              <Button
                onClick={handlePause}
                variant="outline"
                size="lg"
                className="w-16 h-16 rounded-full"
              >
                <Pause className="w-6 h-6" />
              </Button>
              <Button
                onClick={handleStop}
                variant="destructive"
                size="lg"
                className="w-16 h-16 rounded-full"
              >
                <Square className="w-6 h-6" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 提示 */}
      {timer.isRunning && !timer.isPaused && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground mt-4"
        >
          保持专注，你可以的！
        </motion.p>
      )}
    </div>
  );
}
