import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { 
  Share2, 
  X,
  Play,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';

interface TaskRingProps {
  onTaskSelect?: (taskId: string) => void;
}

interface RingSegment {
  taskId: string;
  title: string;
  color: string;
  duration: number;
  percentage: number;
  startAngle: number;
  endAngle: number;
}

export function TaskRing({ onTaskSelect }: TaskRingProps) {
  const { state, startTimer } = useApp();
  const { todayTasks } = state;
  const [selectedSegment, setSelectedSegment] = useState<RingSegment | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // 计算圆环数据
  const segments = useMemo(() => {
    const completedTasks = todayTasks.filter(t => t.completed && t.actualMinutes);
    if (completedTasks.length === 0) return [];

    const totalMinutes = completedTasks.reduce((sum, t) => sum + (t.actualMinutes || 0), 0);
    let currentAngle = 0;

    return completedTasks.map((task) => {
      const duration = task.actualMinutes || 0;
      const percentage = (duration / totalMinutes) * 100;
      const angle = (percentage / 100) * 360;
      const segment: RingSegment = {
        taskId: task.id,
        title: task.title,
        color: task.colorHex || '#00D26A',
        duration,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
      };
      currentAngle += angle;
      return segment;
    });
  }, [todayTasks]);

  // 生成SVG路径
  const createArcPath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = 100 + innerRadius * Math.cos(startRad);
    const y1 = 100 + innerRadius * Math.sin(startRad);
    const x2 = 100 + outerRadius * Math.cos(startRad);
    const y2 = 100 + outerRadius * Math.sin(startRad);

    const x3 = 100 + outerRadius * Math.cos(endRad);
    const y3 = 100 + outerRadius * Math.sin(endRad);
    const x4 = 100 + innerRadius * Math.cos(endRad);
    const y4 = 100 + innerRadius * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}`;
  };

  const totalMinutes = segments.reduce((sum, s) => sum + s.duration, 0);
  const totalTasks = segments.length;

  const handleSegmentClick = (segment: RingSegment, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedSegment(segment);
    setShowTooltip(true);
  };

  const handleContinueTask = () => {
    if (selectedSegment) {
      const task = todayTasks.find(t => t.id === selectedSegment.taskId);
      if (task) {
        startTimer(task.id, task.title);
        onTaskSelect?.(task.id);
      }
    }
    setShowTooltip(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: '我的今日任务完成情况',
        text: `今日完成 ${totalTasks} 个任务，专注 ${Math.floor(totalMinutes)} 分钟`,
      });
    }
  };

  if (segments.length === 0) {
    return (
      <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">今日专注分布</h3>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Clock className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">还没有完成的任务</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            开始一个任务并计时吧
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 border border-border/50">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">今日专注分布</h3>
        <button
          onClick={handleShare}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <Share2 className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <Target className="w-4 h-4" />
            <span className="text-xs">任务数</span>
          </div>
          <p className="text-xl font-bold">{totalTasks}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">总时长</span>
          </div>
          <p className="text-xl font-bold">{Math.floor(totalMinutes)}<span className="text-sm font-normal">分</span></p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">效率</span>
          </div>
          <p className="text-xl font-bold">{Math.round((totalTasks / todayTasks.length) * 100)}%</p>
        </div>
      </div>

      {/* 圆环 */}
      <div className="relative">
        <svg viewBox="0 0 200 200" className="w-full max-w-[280px] mx-auto">
          {/* 背景圆环 */}
          <circle
            cx="100"
            cy="100"
            r="75"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="30"
            opacity="0.3"
          />
          
          {/* 任务段 */}
          {segments.map((segment, index) => (
            <motion.path
              key={segment.taskId}
              d={createArcPath(segment.startAngle, segment.endAngle, 60, 90)}
              fill={segment.color}
              stroke="none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              onClick={(e) => handleSegmentClick(segment, e)}
              className="cursor-pointer"
              style={{ transformOrigin: '100px 100px' }}
            />
          ))}
          
          {/* 中心文字 */}
          <text
            x="100"
            y="95"
            textAnchor="middle"
            className="fill-foreground text-sm font-medium"
          >
            今日专注
          </text>
          <text
            x="100"
            y="115"
            textAnchor="middle"
            className="fill-primary text-2xl font-bold"
          >
            {Math.floor(totalMinutes)}<tspan className="text-sm">分</tspan>
          </text>
        </svg>

        {/* 图例 */}
        <div className="mt-4 space-y-2">
          {segments.slice(0, 5).map((segment) => (
            <div
              key={segment.taskId}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-muted-foreground truncate max-w-[150px]">
                  {segment.title}
                </span>
              </div>
              <span className="text-foreground font-medium">
                {segment.duration}分
              </span>
            </div>
          ))}
          {segments.length > 5 && (
            <p className="text-xs text-muted-foreground text-center">
              还有 {segments.length - 5} 个任务...
            </p>
          )}
        </div>
      </div>

      {/* 任务详情弹窗 */}
      <AnimatePresence>
        {showTooltip && selectedSegment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTooltip(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">任务详情</h4>
                <button
                  onClick={() => setShowTooltip(false)}
                  className="p-1 rounded-full hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${selectedSegment.color}30` }}
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: selectedSegment.color }}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{selectedSegment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      占比 {selectedSegment.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold">{selectedSegment.duration}</p>
                    <p className="text-xs text-muted-foreground">实际用时(分)</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold">
                      {todayTasks.find(t => t.id === selectedSegment.taskId)?.estimatedMinutes || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">预计用时(分)</p>
                  </div>
                </div>
                
                <button
                  onClick={handleContinueTask}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  继续此任务
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
