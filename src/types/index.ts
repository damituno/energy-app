// 能量级别
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

// 任务类型
export type TaskType = 'basic' | 'normal' | 'challenge';

// 任务状态
export type TaskStatus = 'todo' | 'doing' | 'done' | 'skipped';

// 任务
export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  completed: boolean;
  points: number;
  estimatedMinutes: number;
  actualMinutes?: number;
  colorHex?: string;
  createdAt: Date;
  completedAt?: Date;
  dueDate?: Date;
  priority: number;
  energyLevel: 'low' | 'medium' | 'high';
  tags: string[];
}

// 每日状态记录
export interface DailyStatus {
  date: string;
  energyLevel: EnergyLevel;
  mood: string;
  sleep?: number;
  notes?: string;
}

// 用户画像
export interface UserProfile {
  userId: string;
  nickname: string;
  avatarUrl?: string;
  gender?: 'male' | 'female' | 'other';
  // 问卷字段
  taskTypes: ('study' | 'work' | 'life' | 'sport' | 'creative')[];
  preferredTime: 'morning' | 'forenoon' | 'afternoon' | 'evening' | 'any';
  focusCapacityMinutes: number;
  targetMajorTasks: number;
  lowStatePref: 'auto_shift' | 'keep_base' | 'short_tasks' | 'manual';
  completionStyle: 'planner' | 'procrastinator' | 'distractable' | 'sporadic';
  pomodoroPref: number[];
  stressSources: string[];
  reminderFrequency: 'low' | 'medium' | 'high';
  monthPlanOptIn: boolean;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// 用户
export interface User {
  id: string;
  phone: string;
  wechatOpenId?: string;
  nickname: string;
  avatarUrl?: string;
  createdAt: Date;
  lastLogin: Date;
  isNewUser: boolean;
  hasCompletedQuestionnaire: boolean;
}

// 用户统计
export interface UserStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  completionRate: number;
  bestTimeOfDay: string;
  averageEnergy: number;
  totalFocusMinutes: number;
}

// 成就
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

// 随机事件
export interface RandomEvent {
  id: string;
  type: 'lucky' | 'help' | 'challenge' | 'reward';
  title: string;
  description: string;
  points?: number;
  expiresAt: Date;
}

// 每日计划
export interface DailyPlan {
  id: string;
  userId: string;
  date: string;
  tasks: PlanTask[];
  totalEstimatedMinutes: number;
  version: number;
  createdAt: Date;
}

// 计划任务
export interface PlanTask {
  taskId: string;
  title: string;
  scheduledStart: string;
  scheduledEnd: string;
  blockIndex: number;
  tier: TaskType;
  colorHex: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  status: TaskStatus;
}

// 计时日志
export interface TimerLog {
  id: string;
  userId: string;
  taskId: string;
  startTs: Date;
  endTs?: Date;
  durationSeconds: number;
  interrupted: boolean;
  deviceId: string;
}

// 订阅/权益
export interface Subscription {
  id: string;
  userId: string;
  type: 'monthly' | 'yearly' | 'lifetime';
  startTs: Date;
  endTs?: Date;
  trialEndTs?: Date;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  platform: 'wechat' | 'alipay' | 'google';
}

// 用户设置
export interface UserSettings {
  pomodoroDuration: number;
  breakInterval: number;
  dailyGoalPoints: number;
  theme: 'dark' | 'light' | 'auto';
  notifications: boolean;
  soundEnabled: boolean;
  taskWeights: {
    importance: number;
    urgency: number;
    difficulty: number;
  };
}

// 问卷答案
export interface QuestionnaireAnswers {
  taskTypes: ('study' | 'work' | 'life' | 'sport' | 'creative')[];
  preferredTime: 'morning' | 'forenoon' | 'afternoon' | 'evening' | 'any';
  focusCapacityMinutes: number;
  targetMajorTasks: number;
  lowStatePref: 'auto_shift' | 'keep_base' | 'short_tasks' | 'manual';
  completionStyle: 'planner' | 'procrastinator' | 'distractable' | 'sporadic';
  pomodoroPref: number[];
  stressSources: string[];
  reminderFrequency: 'low' | 'medium' | 'high';
  monthPlanOptIn: boolean;
}

// 问卷题目
export interface Question {
  id: string;
  title: string;
  description: string;
  type: 'single' | 'multiple';
  options: {
    value: string;
    label: string;
    description?: string;
  }[];
  field: keyof QuestionnaireAnswers;
  purpose: string;
}

// 应用状态
export interface AppState {
  currentEnergy: EnergyLevel;
  todayTasks: Task[];
  dailyPlan: DailyPlan | null;
  dailyStatus: DailyStatus | null;
  stats: UserStats;
  achievements: Achievement[];
  randomEvents: RandomEvent[];
  settings: UserSettings;
  user: User | null;
  profile: UserProfile | null;
  subscription: Subscription | null;
  isDarkMode: boolean;
  isLoading: boolean;
}

// 计时器状态
export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  startTime: Date | null;
  pausedTime: Date | null;
  totalPausedSeconds: number;
  currentTaskId: string | null;
  currentTaskTitle: string | null;
}
