import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { 
  Flame, 
  Target, 
  TrendingUp, 
  Clock,
  Calendar,
  Award,
  Zap,
  Battery
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// 模拟一周数据
const weeklyData = [
  { day: '周一', energy: 3, completed: 5, total: 7 },
  { day: '周二', energy: 4, completed: 6, total: 8 },
  { day: '周三', energy: 2, completed: 3, total: 6 },
  { day: '周四', energy: 5, completed: 8, total: 9 },
  { day: '周五', energy: 4, completed: 7, total: 8 },
  { day: '周六', energy: 3, completed: 4, total: 5 },
  { day: '周日', energy: 4, completed: 6, total: 7 },
];

// 任务类型分布
const taskTypeData = [
  { name: '基础任务', value: 35, color: '#FF6B6B' },
  { name: '常规任务', value: 45, color: '#FFD93D' },
  { name: '挑战任务', value: 20, color: '#00D26A' },
];

// 成就列表
const achievements = [
  { id: '1', title: '初出茅庐', description: '完成第一个任务', icon: '🌱', unlocked: true },
  { id: '2', title: '坚持一周', description: '连续7天完成任务', icon: '🔥', unlocked: true },
  { id: '3', title: '能量满满', description: '连续3天能量等级5', icon: '⚡', unlocked: false },
  { id: '4', title: '任务达人', description: '累计完成100个任务', icon: '🏆', unlocked: false },
  { id: '5', title: '早起鸟', description: '连续5天8点前起床', icon: '🌅', unlocked: true },
  { id: '6', title: '深度专注', description: '单次专注超过2小时', icon: '🎯', unlocked: false },
];

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: typeof Flame;
  color: string;
  delay?: number;
}

function StatCard({ title, value, subtitle, icon: Icon, color, delay = 0 }: StatCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const numericValue = typeof value === 'string' ? parseInt(value) || 0 : value;

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1000;
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setAnimatedValue(numericValue);
          clearInterval(interval);
        } else {
          setAnimatedValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [numericValue, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1" style={{ color }}>
            {typeof value === 'string' && !parseInt(value) ? value : animatedValue}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

export function StatsPage() {
  const { state } = useApp();
  const { stats } = state;

  return (
    <div className="space-y-6 pb-24">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">数据统计</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>本周</span>
        </div>
      </div>

      {/* 统计卡片网格 */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="连续天数"
          value={stats.currentStreak}
          subtitle="最长: {stats.longestStreak} 天"
          icon={Flame}
          color="#FF6B6B"
          delay={0}
        />
        <StatCard
          title="总积分"
          value={stats.totalPoints}
          icon={Target}
          color="#FFD93D"
          delay={0.1}
        />
        <StatCard
          title="完成率"
          value={`${stats.completionRate}%`}
          subtitle="{stats.totalTasksCompleted} 个任务"
          icon={TrendingUp}
          color="#00D26A"
          delay={0.2}
        />
        <StatCard
          title="最佳时段"
          value={stats.bestTimeOfDay}
          icon={Clock}
          color="#A8E6CF"
          delay={0.3}
        />
      </div>

      {/* 能量趋势图 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">能量趋势</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Battery className="w-4 h-4" />
            <span>近7天</span>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                stroke="#666" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#666" 
                fontSize={12}
                tickLine={false}
                domain={[0, 5]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#00D26A"
                strokeWidth={2}
                dot={{ fill: '#00D26A', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#00D26A' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 任务完成情况 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">任务完成</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="w-4 h-4" />
            <span>近7天</span>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                stroke="#666" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#666" 
                fontSize={12}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="completed" fill="#00D26A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" fill="#333" radius={[4, 4, 0, 0]} opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 任务类型分布 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">任务类型分布</h3>
          <Zap className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {taskTypeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 成就 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          <h3 className="font-semibold text-foreground">成就徽章</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.05 }}
              className={`relative p-3 rounded-xl border text-center ${
                achievement.unlocked
                  ? 'bg-card border-border/50'
                  : 'bg-muted/30 border-transparent opacity-50'
              }`}
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <p className={`text-xs font-medium ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                {achievement.title}
              </p>
              {achievement.unlocked && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
