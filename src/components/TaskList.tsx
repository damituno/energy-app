import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  Zap, 
  Battery, 
  BatteryLow,
  Trophy,
  ChevronDown,
  ChevronUp,
  Play,
  Clock,
} from 'lucide-react';
import type { TaskType } from '@/types';

const taskTypeConfig: Record<TaskType, { label: string; icon: typeof Battery; color: string; bgColor: string }> = {
  basic: { 
    label: '基础任务', 
    icon: BatteryLow, 
    color: 'text-red-400',
    bgColor: 'bg-red-400/10'
  },
  normal: { 
    label: '常规任务', 
    icon: Battery, 
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10'
  },
  challenge: { 
    label: '挑战任务', 
    icon: Zap, 
    color: 'text-green-400',
    bgColor: 'bg-green-400/10'
  },
};

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    description?: string;
    type: TaskType;
    completed: boolean;
    points: number;
    estimatedMinutes: number;
    colorHex?: string;
  };
  onToggle: () => void;
  onDelete: () => void;
  onStartTimer: () => void;
}

function TaskItem({ task, onToggle, onDelete, onStartTimer }: TaskItemProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const config = taskTypeConfig[task.type];
  const Icon = config.icon;

  const handleToggle = () => {
    if (!task.completed) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 800);
    }
    onToggle();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`relative group flex items-center gap-3 p-4 rounded-2xl border transition-all ${
        task.completed 
          ? 'bg-muted/30 border-transparent' 
          : 'bg-card border-border/50 hover:border-border'
      }`}
    >
      {/* 完成粒子效果 */}
      <AnimatePresence>
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-yellow-400"
                style={{
                  left: '20px',
                  top: '50%',
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                  x: Math.cos((i / 6) * Math.PI * 2) * 80,
                  y: Math.sin((i / 6) * Math.PI * 2) * 80 - 20,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: i * 0.03 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* 复选框 */}
      <button
        onClick={handleToggle}
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
          task.completed 
            ? 'bg-primary' 
            : 'border-2 border-muted-foreground/30 hover:border-primary'
        }`}
      >
        {task.completed && (
          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* 任务图标 */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bgColor}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>

      {/* 任务内容 */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate transition-all ${
          task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
        }`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 text-sm">
          {task.description && (
            <span className={`truncate ${task.completed ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
              {task.description}
            </span>
          )}
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            {task.estimatedMinutes}分
          </span>
        </div>
      </div>

      {/* 分数 */}
      <div className="flex items-center gap-1 text-sm">
        <Trophy className="w-3.5 h-3.5 text-orange-400" />
        <span className={task.completed ? 'text-muted-foreground' : 'text-orange-400'}>
          {task.points}
        </span>
      </div>

      {/* 开始计时按钮 */}
      {!task.completed && (
        <button
          onClick={onStartTimer}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
        >
          <Play className="w-4 h-4" />
        </button>
      )}

      {/* 删除按钮 */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: showDelete ? 1 : 0, scale: showDelete ? 1 : 0.8 }}
        onClick={onDelete}
        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </motion.button>

      {/* 滑动显示删除 */}
      <div 
        className="absolute inset-y-0 right-0 w-16 flex items-center justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
      />
    </motion.div>
  );
}

interface TaskGroupProps {
  type: TaskType;
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    type: TaskType;
    completed: boolean;
    points: number;
    estimatedMinutes: number;
    colorHex?: string;
  }>;
  isExpanded: boolean;
  onToggle: () => void;
  onTaskToggle: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onStartTimer: (taskId: string, title: string) => void;
}

function TaskGroup({ type, tasks, isExpanded, onToggle, onTaskToggle, onTaskDelete, onStartTimer }: TaskGroupProps) {
  const config = taskTypeConfig[type];
  const Icon = config.icon;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-2">
      {/* 分组标题 */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-card/50 hover:bg-card transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bgColor}`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-foreground">{config.label}</h3>
            <p className="text-xs text-muted-foreground">
              {completedCount}/{tasks.length} 完成
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${config.bgColor} ${config.color}`}>
            {tasks.reduce((sum, t) => sum + t.points, 0)} 分
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* 任务列表 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pl-2">
              <AnimatePresence mode="popLayout">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => onTaskToggle(task.id)}
                    onDelete={() => onTaskDelete(task.id)}
                    onStartTimer={() => onStartTimer(task.id, task.title)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TaskList() {
  const { toggleTask, deleteTask, addTask, getFilteredTasks, startTimer } = useApp();
  const [expandedGroups, setExpandedGroups] = useState<Record<TaskType, boolean>>({
    basic: true,
    normal: true,
    challenge: true,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'normal' as TaskType,
    points: 8,
    estimatedMinutes: 30,
  });

  const filteredTasks = getFilteredTasks();
  
  const groupedTasks = {
    basic: filteredTasks.filter(t => t.type === 'basic'),
    normal: filteredTasks.filter(t => t.type === 'normal'),
    challenge: filteredTasks.filter(t => t.type === 'challenge'),
  };

  const toggleGroup = (type: TaskType) => {
    setExpandedGroups(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      addTask({
        ...newTask,
        status: 'todo',
        completed: false,
        priority: 1,
        energyLevel: newTask.type === 'basic' ? 'low' : newTask.type === 'challenge' ? 'high' : 'medium',
        tags: [],
      });
      setNewTask({ title: '', description: '', type: 'normal', points: 8, estimatedMinutes: 30 });
      setIsAddDialogOpen(false);
    }
  };

  const handleStartTimer = (taskId: string, title: string) => {
    startTimer(taskId, title);
  };

  return (
    <div className="space-y-4">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">今日任务</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <Button size="sm" className="gap-1" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            添加
          </Button>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>添加新任务</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>任务名称</Label>
                <Input
                  placeholder="输入任务名称..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>描述（可选）</Label>
                <Input
                  placeholder="添加描述..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>任务类型</Label>
                  <Select
                    value={newTask.type}
                    onValueChange={(v) => setNewTask({ ...newTask, type: v as TaskType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">基础任务</SelectItem>
                      <SelectItem value="normal">常规任务</SelectItem>
                      <SelectItem value="challenge">挑战任务</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>预计时长(分)</Label>
                  <Input
                    type="number"
                    value={newTask.estimatedMinutes}
                    onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: parseInt(e.target.value) || 30 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>分数</Label>
                <Input
                  type="number"
                  value={newTask.points}
                  onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) || 0 })}
                />
              </div>
              <Button onClick={handleAddTask} className="w-full">
                添加任务
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 任务分组 */}
      <div className="space-y-3">
        {(Object.keys(groupedTasks) as TaskType[]).map((type) => (
          <TaskGroup
            key={type}
            type={type}
            tasks={groupedTasks[type]}
            isExpanded={expandedGroups[type]}
            onToggle={() => toggleGroup(type)}
            onTaskToggle={toggleTask}
            onTaskDelete={deleteTask}
            onStartTimer={handleStartTimer}
          />
        ))}
      </div>

      {/* 空状态 */}
      {filteredTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Zap className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">当前能量状态下暂无任务</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            调整能量级别或添加新任务
          </p>
        </motion.div>
      )}
    </div>
  );
}
