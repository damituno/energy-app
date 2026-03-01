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
  Search,
  Filter,
} from 'lucide-react';
import type { TaskType } from '@/types';

const taskTypeConfig: Record<TaskType, { label: string; color: string; bgColor: string; borderColor: string }> = {
  basic: { 
    label: '基础', 
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/30'
  },
  normal: { 
    label: '常规', 
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30'
  },
  challenge: { 
    label: '挑战', 
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/30'
  },
};

export function TasksPage() {
  const { state, toggleTask, deleteTask, addTask } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<TaskType | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'normal' as TaskType,
    points: 8,
    estimatedMinutes: 30,
  });

  const filteredTasks = state.todayTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || task.type === filterType;
    return matchesSearch && matchesType;
  });

  const completedCount = filteredTasks.filter(t => t.completed).length;
  const totalPoints = filteredTasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);

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

  return (
    <div className="space-y-4 pb-24">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">任务管理</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {completedCount}/{filteredTasks.length} 完成 · {totalPoints} 分
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <Button size="icon" className="rounded-full" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-5 h-5" />
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
      </motion.div>

      {/* 搜索和筛选 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as TaskType | 'all')}>
          <SelectTrigger className="w-28">
            <Filter className="w-4 h-4 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="basic">基础</SelectItem>
            <SelectItem value="normal">常规</SelectItem>
            <SelectItem value="challenge">挑战</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* 任务列表 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task, index) => {
            const config = taskTypeConfig[task.type];
            
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ delay: index * 0.05 }}
                className={`group flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  task.completed 
                    ? 'bg-muted/30 border-transparent' 
                    : `bg-card ${config.borderColor}`
                }`}
              >
                {/* 复选框 */}
                <button
                  onClick={() => toggleTask(task.id)}
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

                {/* 任务类型标签 */}
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                  {config.label}
                </span>

                {/* 任务内容 */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${
                    task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                  }`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className={`text-sm truncate ${task.completed ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                      {task.description}
                    </p>
                  )}
                </div>

                {/* 分数 */}
                <div className="flex items-center gap-1 text-sm">
                  <Trophy className="w-3.5 h-3.5 text-orange-400" />
                  <span className={task.completed ? 'text-muted-foreground' : 'text-orange-400'}>
                    {task.points}
                  </span>
                </div>

                {/* 删除按钮 */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* 空状态 */}
        {filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">没有找到任务</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              尝试调整筛选条件或添加新任务
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* 任务类型说明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-2"
      >
        <div className="p-3 rounded-xl bg-red-400/10 border border-red-400/20 text-center">
          <BatteryLow className="w-5 h-5 mx-auto mb-1 text-red-400" />
          <p className="text-xs font-medium text-red-400">基础任务</p>
          <p className="text-xs text-muted-foreground">5分</p>
        </div>
        <div className="p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-center">
          <Battery className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
          <p className="text-xs font-medium text-yellow-400">常规任务</p>
          <p className="text-xs text-muted-foreground">8分</p>
        </div>
        <div className="p-3 rounded-xl bg-green-400/10 border border-green-400/20 text-center">
          <Zap className="w-5 h-5 mx-auto mb-1 text-green-400" />
          <p className="text-xs font-medium text-green-400">挑战任务</p>
          <p className="text-xs text-muted-foreground">12分</p>
        </div>
      </motion.div>
    </div>
  );
}
