import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { Preferences } from '@capacitor/preferences';
import type { 
  EnergyLevel, 
  Task, 
  TaskStatus,
  DailyStatus, 
  UserStats, 
  Achievement, 
  RandomEvent,
  UserSettings,
  User,
  UserProfile,
  DailyPlan,
  Subscription,
  QuestionnaireAnswers,
  TimerState,
  TimerLog
} from '@/types';
import {
  auth,
  onAuthStateChanged,
  type FirebaseUser
} from '@/lib/firebase';

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// 初始示例任务
const createInitialTasks = (): Task[] => [
  { id: generateId(), title: '喝水', description: '喝一杯温水', type: 'basic', status: 'todo', completed: false, points: 5, estimatedMinutes: 5, priority: 1, energyLevel: 'low', tags: ['健康'], colorHex: '#4ECDC4', createdAt: new Date() },
  { id: generateId(), title: '冥想', description: '5分钟深呼吸', type: 'basic', status: 'todo', completed: false, points: 5, estimatedMinutes: 5, priority: 2, energyLevel: 'low', tags: ['健康'], colorHex: '#95E1D3', createdAt: new Date() },
  { id: generateId(), title: '散步', description: '10分钟轻松步行', type: 'basic', status: 'todo', completed: false, points: 5, estimatedMinutes: 10, priority: 3, energyLevel: 'low', tags: ['运动'], colorHex: '#00D26A', createdAt: new Date() },
  { id: generateId(), title: '回复邮件', description: '处理收件箱', type: 'normal', status: 'todo', completed: false, points: 8, estimatedMinutes: 30, priority: 4, energyLevel: 'medium', tags: ['工作'], colorHex: '#FFD93D', createdAt: new Date() },
  { id: generateId(), title: '团队会议', description: '参加每日站会', type: 'normal', status: 'todo', completed: false, points: 8, estimatedMinutes: 30, priority: 5, energyLevel: 'medium', tags: ['工作'], colorHex: '#F38181', createdAt: new Date() },
  { id: generateId(), title: '代码审查', description: '审查PR请求', type: 'normal', status: 'todo', completed: false, points: 8, estimatedMinutes: 45, priority: 6, energyLevel: 'medium', tags: ['工作'], colorHex: '#AA96DA', createdAt: new Date() },
  { id: generateId(), title: '深度工作', description: '2小时专注编程', type: 'challenge', status: 'todo', completed: false, points: 12, estimatedMinutes: 120, priority: 7, energyLevel: 'high', tags: ['工作'], colorHex: '#FCBAD3', createdAt: new Date() },
  { id: generateId(), title: '学习新技能', description: '阅读技术文档', type: 'challenge', status: 'todo', completed: false, points: 12, estimatedMinutes: 60, priority: 8, energyLevel: 'high', tags: ['学习'], colorHex: '#FF6B6B', createdAt: new Date() },
  { id: generateId(), title: '健身', description: '30分钟运动', type: 'challenge', status: 'todo', completed: false, points: 12, estimatedMinutes: 30, priority: 9, energyLevel: 'high', tags: ['运动'], colorHex: '#00D26A', createdAt: new Date() },
];

// 初始成就
const initialAchievements: Achievement[] = [
  { id: '1', title: '初出茅庐', description: '完成第一个任务', icon: '🌱', progress: 0, maxProgress: 1 },
  { id: '2', title: '坚持一周', description: '连续7天完成任务', icon: '🔥', progress: 0, maxProgress: 7 },
  { id: '3', title: '能量满满', description: '连续3天能量等级5', icon: '⚡', progress: 0, maxProgress: 3 },
  { id: '4', title: '任务达人', description: '累计完成100个任务', icon: '🏆', progress: 0, maxProgress: 100 },
];

// 初始设置
const initialSettings: UserSettings = {
  pomodoroDuration: 25,
  breakInterval: 5,
  dailyGoalPoints: 50,
  theme: 'dark',
  notifications: true,
  soundEnabled: true,
  taskWeights: {
    importance: 0.4,
    urgency: 0.3,
    difficulty: 0.3,
  },
};

// 初始统计
const initialStats: UserStats = {
  totalPoints: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalTasksCompleted: 0,
  completionRate: 0,
  bestTimeOfDay: '上午',
  averageEnergy: 3,
  totalFocusMinutes: 0,
};

// 初始计时器状态
const initialTimerState: TimerState = {
  isRunning: false,
  isPaused: false,
  startTime: null,
  pausedTime: null,
  totalPausedSeconds: 0,
  currentTaskId: null,
  currentTaskTitle: null,
};

// State 类型
interface State {
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
  isAuthenticated: boolean;
  timer: TimerState;
  currentTimerLog: TimerLog | null;
}

// Action 类型
type Action =
  | { type: 'SET_ENERGY'; payload: EnergyLevel }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_SUBSCRIPTION'; payload: Subscription | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'UPDATE_TASK_STATUS'; payload: { taskId: string; status: TaskStatus } }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_DAILY_PLAN'; payload: DailyPlan | null }
  | { type: 'SET_DAILY_STATUS'; payload: DailyStatus }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'TOGGLE_THEME' }
  | { type: 'ADD_RANDOM_EVENT'; payload: RandomEvent }
  | { type: 'COMPLETE_RANDOM_EVENT'; payload: string }
  | { type: 'UPDATE_STATS'; payload: Partial<UserStats> }
  | { type: 'TIMER_START'; payload: { taskId: string; taskTitle: string } }
  | { type: 'TIMER_PAUSE' }
  | { type: 'TIMER_RESUME' }
  | { type: 'TIMER_STOP' }
  | { type: 'SET_TIMER_LOG'; payload: TimerLog | null }
  | { type: 'LOAD_STATE'; payload: State }
  | { type: 'RESET_STATE' };

// 初始状态
const initialState: State = {
  currentEnergy: 3,
  todayTasks: createInitialTasks(),
  dailyPlan: null,
  dailyStatus: null,
  stats: initialStats,
  achievements: initialAchievements,
  randomEvents: [],
  settings: initialSettings,
  user: null,
  profile: null,
  subscription: null,
  isDarkMode: true,
  isLoading: true,
  isAuthenticated: false,
  timer: initialTimerState,
  currentTimerLog: null,
};

// Reducer
function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ENERGY':
      return { ...state, currentEnergy: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    
    case 'SET_SUBSCRIPTION':
      return { ...state, subscription: action.payload };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'TOGGLE_TASK': {
      const taskId = action.payload;
      const updatedTasks = state.todayTasks.map(task => {
        if (task.id === taskId) {
          const newCompleted = !task.completed;
          return {
            ...task,
            completed: newCompleted,
            status: (newCompleted ? 'done' : 'todo') as TaskStatus,
            completedAt: newCompleted ? new Date() : undefined,
          };
        }
        return task;
      });
      
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const totalCount = updatedTasks.length;
      const newStats = {
        ...state.stats,
        totalTasksCompleted: state.stats.totalTasksCompleted + (updatedTasks.find(t => t.id === taskId)?.completed ? 1 : 0),
        completionRate: Math.round((completedCount / totalCount) * 100),
      };
      
      return { ...state, todayTasks: updatedTasks, stats: newStats };
    }
    
    case 'UPDATE_TASK_STATUS': {
      const { taskId, status } = action.payload;
      const updatedTasks = state.todayTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            status,
            completed: status === 'done',
            completedAt: status === 'done' ? new Date() : undefined,
          };
        }
        return task;
      });
      return { ...state, todayTasks: updatedTasks };
    }
    
    case 'ADD_TASK':
      return { ...state, todayTasks: [...state.todayTasks, action.payload] };
    
    case 'DELETE_TASK':
      return { ...state, todayTasks: state.todayTasks.filter(t => t.id !== action.payload) };
    
    case 'SET_DAILY_PLAN':
      return { ...state, dailyPlan: action.payload };
    
    case 'SET_DAILY_STATUS':
      return { ...state, dailyStatus: action.payload };
    
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    
    case 'TOGGLE_THEME':
      return { ...state, isDarkMode: !state.isDarkMode };
    
    case 'ADD_RANDOM_EVENT':
      return { ...state, randomEvents: [...state.randomEvents, action.payload] };
    
    case 'COMPLETE_RANDOM_EVENT':
      return { ...state, randomEvents: state.randomEvents.filter(e => e.id !== action.payload) };
    
    case 'UPDATE_STATS':
      return { ...state, stats: { ...state.stats, ...action.payload } };
    
    case 'TIMER_START':
      return {
        ...state,
        timer: {
          isRunning: true,
          isPaused: false,
          startTime: new Date(),
          pausedTime: null,
          totalPausedSeconds: 0,
          currentTaskId: action.payload.taskId,
          currentTaskTitle: action.payload.taskTitle,
        }
      };
    
    case 'TIMER_PAUSE':
      return {
        ...state,
        timer: {
          ...state.timer,
          isPaused: true,
          pausedTime: new Date(),
        }
      };
    
    case 'TIMER_RESUME':
      return {
        ...state,
        timer: {
          ...state.timer,
          isPaused: false,
          totalPausedSeconds: state.timer.totalPausedSeconds + 
            (state.timer.pausedTime ? Math.floor((new Date().getTime() - state.timer.pausedTime.getTime()) / 1000) : 0),
          pausedTime: null,
        }
      };
    
    case 'TIMER_STOP':
      return {
        ...state,
        timer: initialTimerState,
      };
    
    case 'SET_TIMER_LOG':
      return { ...state, currentTimerLog: action.payload };
    
    case 'LOAD_STATE':
      return action.payload;
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
  // 便捷方法
  setEnergy: (level: EnergyLevel) => void;
  toggleTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  deleteTask: (taskId: string) => void;
  setDailyStatus: (status: Omit<DailyStatus, 'date'>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  toggleTheme: () => void;
  getFilteredTasks: () => Task[];
  getTodayPoints: () => number;
  getTargetPoints: () => number;
  // 用户相关
  login: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
  completeQuestionnaire: (answers: QuestionnaireAnswers) => Promise<void>;
  generatePlan: (date?: string) => Promise<void>;
  // 计时器相关
  startTimer: (taskId: string, taskTitle: string) => Promise<void>;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => Promise<void>;
  getTimerDuration: () => number;
  // VIP 相关
  isVip: () => boolean;
  getTrialDaysLeft: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 从本地存储加载数据
  useEffect(() => {
    const loadState = async () => {
      try {
        const { value } = await Preferences.get({ key: 'energy-app-state' });
        if (value) {
          const parsed = JSON.parse(value);
          dispatch({ type: 'LOAD_STATE', payload: { ...initialState, ...parsed, isLoading: false } });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (e) {
        console.error('Failed to load state:', e);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadState();
  }, []);

  // 保存到本地存储
  useEffect(() => {
    const saveState = async () => {
      try {
        await Preferences.set({
          key: 'energy-app-state',
          value: JSON.stringify(state),
        });
      } catch (e) {
        console.error('Failed to save state:', e);
      }
    };
    if (!state.isLoading) {
      saveState();
    }
  }, [state]);

  // 监听认证状态
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      } else {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    });

    return () => unsubscribe();
  }, []);

  // 便捷方法
  const setEnergy = (level: EnergyLevel) => dispatch({ type: 'SET_ENERGY', payload: level });
  
  const toggleTask = (taskId: string) => dispatch({ type: 'TOGGLE_TASK', payload: taskId });
  
  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    dispatch({ type: 'UPDATE_TASK_STATUS', payload: { taskId, status } });
  };
  
  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    dispatch({ 
      type: 'ADD_TASK', 
      payload: { 
        ...task, 
        id: generateId(), 
        createdAt: new Date(),
        colorHex: task.colorHex || getTaskColor(Math.random()),
      } 
    });
  };
  
  const deleteTask = (taskId: string) => dispatch({ type: 'DELETE_TASK', payload: taskId });
  
  const setDailyStatus = (status: Omit<DailyStatus, 'date'>) => {
    dispatch({ 
      type: 'SET_DAILY_STATUS', 
      payload: { ...status, date: new Date().toISOString().split('T')[0] } 
    });
  };
  
  const updateSettings = (settings: Partial<UserSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };
  
  const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' });

  // 根据能量级别过滤任务
  const getFilteredTasks = () => {
    const { currentEnergy, todayTasks } = state;
    
    if (currentEnergy <= 2) {
      return todayTasks.filter(t => t.energyLevel === 'low' || t.type === 'basic');
    } else if (currentEnergy <= 4) {
      return todayTasks.filter(t => t.energyLevel !== 'high');
    } else {
      return todayTasks;
    }
  };

  const getTodayPoints = () => {
    return state.todayTasks
      .filter(t => t.completed)
      .reduce((sum, t) => sum + t.points, 0);
  };

  const getTargetPoints = () => {
    const { currentEnergy } = state;
    const basePoints = state.settings.dailyGoalPoints;
    
    if (currentEnergy <= 2) return Math.floor(basePoints * 0.6);
    if (currentEnergy <= 4) return basePoints;
    return Math.floor(basePoints * 1.2);
  };

  // 用户登录（模拟）
  const login = async (phone: string) => {
    const mockUser: User = {
      id: generateId(),
      phone,
      nickname: '用户' + phone.slice(-4),
      createdAt: new Date(),
      lastLogin: new Date(),
      isNewUser: true,
      hasCompletedQuestionnaire: false,
    };
    dispatch({ type: 'SET_USER', payload: mockUser });
    dispatch({ type: 'SET_AUTHENTICATED', payload: true });
  };

  // 用户登出
  const logout = async () => {
    dispatch({ type: 'RESET_STATE' });
  };

  // 完成问卷
  const completeQuestionnaire = async (answers: QuestionnaireAnswers) => {
    if (state.user) {
      const profile: UserProfile = {
        userId: state.user.id,
        nickname: state.user.nickname,
        ...answers,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dispatch({ type: 'SET_PROFILE', payload: profile });
      
      dispatch({
        type: 'SET_USER',
        payload: { ...state.user, hasCompletedQuestionnaire: true, isNewUser: false }
      });
    }
  };

  // 生成每日计划
  const generatePlan = async () => {
    if (state.user && state.profile) {
      const targetDate = new Date().toISOString().split('T')[0];
      
      let filteredTasks = state.todayTasks;
      if (state.currentEnergy <= 2) {
        filteredTasks = state.todayTasks.filter(t => t.energyLevel === 'low' || t.type === 'basic');
      } else if (state.currentEnergy <= 4) {
        filteredTasks = state.todayTasks.filter(t => t.energyLevel !== 'high');
      }
      
      const selectedTasks = filteredTasks.slice(0, state.profile.targetMajorTasks || 5);
      
      let currentTime = new Date();
      currentTime.setHours(9, 0, 0, 0);
      
      const planTasks = selectedTasks.map((task, index) => {
        const estimatedMinutes = task.estimatedMinutes || 30;
        const startTime = new Date(currentTime);
        const endTime = new Date(currentTime.getTime() + estimatedMinutes * 60000);
        
        const planTask = {
          taskId: task.id,
          title: task.title,
          scheduledStart: startTime.toISOString(),
          scheduledEnd: endTime.toISOString(),
          blockIndex: index,
          tier: task.type,
          colorHex: task.colorHex || '#00D26A',
          estimatedMinutes,
          status: 'todo' as TaskStatus,
        };
        
        currentTime = new Date(endTime.getTime() + (state.profile?.pomodoroPref?.[0] || 5) * 60000);
        
        return planTask;
      });
      
      const plan: DailyPlan = {
        id: generateId(),
        userId: state.user.id,
        date: targetDate,
        tasks: planTasks,
        totalEstimatedMinutes: planTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
        version: 1,
        createdAt: new Date(),
      };
      
      dispatch({ type: 'SET_DAILY_PLAN', payload: plan });
    }
  };

  // 计时器相关
  const startTimer = async (taskId: string, taskTitle: string) => {
    dispatch({ type: 'TIMER_START', payload: { taskId, taskTitle } });
    
    const log: TimerLog = {
      id: generateId(),
      userId: state.user?.id || '',
      taskId,
      startTs: new Date(),
      durationSeconds: 0,
      interrupted: false,
      deviceId: 'device_' + generateId(),
    };
    dispatch({ type: 'SET_TIMER_LOG', payload: log });
  };

  const pauseTimer = () => {
    dispatch({ type: 'TIMER_PAUSE' });
  };

  const resumeTimer = () => {
    dispatch({ type: 'TIMER_RESUME' });
  };

  const stopTimer = async () => {
    dispatch({ type: 'TIMER_STOP' });
    dispatch({ type: 'SET_TIMER_LOG', payload: null });
  };

  const getTimerDuration = () => {
    if (!state.timer.isRunning || !state.timer.startTime) return 0;
    
    const now = new Date();
    let duration = Math.floor((now.getTime() - state.timer.startTime.getTime()) / 1000);
    
    duration -= state.timer.totalPausedSeconds;
    
    if (state.timer.isPaused && state.timer.pausedTime) {
      duration -= Math.floor((now.getTime() - state.timer.pausedTime.getTime()) / 1000);
    }
    
    return Math.max(0, duration);
  };

  // VIP 相关
  const isVip = () => {
    if (!state.subscription) return false;
    return state.subscription.status === 'active' || 
           (state.subscription.status === 'trial' && getTrialDaysLeft() > 0);
  };

  const getTrialDaysLeft = () => {
    if (!state.subscription?.trialEndTs) return 0;
    const trialEnd = new Date(state.subscription.trialEndTs);
    const now = new Date();
    const diff = trialEnd.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      setEnergy,
      toggleTask,
      updateTaskStatus,
      addTask,
      deleteTask,
      setDailyStatus,
      updateSettings,
      toggleTheme,
      getFilteredTasks,
      getTodayPoints,
      getTargetPoints,
      login,
      logout,
      completeQuestionnaire,
      generatePlan,
      startTimer,
      pauseTimer,
      resumeTimer,
      stopTimer,
      getTimerDuration,
      isVip,
      getTrialDaysLeft,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// 获取任务颜色
function getTaskColor(seed: number): string {
  const colors = [
    '#FF6B6B', '#FFD93D', '#00D26A', '#4ECDC4', '#95E1D3',
    '#F38181', '#AA96DA', '#FCBAD3', '#A8E6CF', '#FFD3B6'
  ];
  return colors[Math.floor(seed * colors.length) % colors.length];
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
