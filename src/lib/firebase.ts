import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// 初始化一次
const app = initializeApp(firebaseConfig);

// 导出实例供其他文件使用
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

// 用户相关操作
export const createUser = async (userId: string, phone: string, nickname: string) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    id: userId,
    phone,
    nickname,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    isNewUser: true,
    hasCompletedQuestionnaire: false,
  });
};

export const getUser = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
};

export const updateUser = async (userId: string, data: Partial<any>) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// 用户画像相关
export const createUserProfile = async (userId: string, answers: any) => {
  const profileRef = doc(db, 'userProfiles', userId);
  await setDoc(profileRef, {
    userId,
    ...answers,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getUserProfile = async (userId: string) => {
  const profileRef = doc(db, 'userProfiles', userId);
  const profileSnap = await getDoc(profileRef);
  if (profileSnap.exists()) {
    return profileSnap.data();
  }
  return null;
};

// 任务相关
export const createTask = async (userId: string, task: any) => {
  const tasksRef = collection(db, 'tasks');
  const taskRef = doc(tasksRef);
  await setDoc(taskRef, {
    ...task,
    userId,
    createdAt: serverTimestamp(),
  });
  return taskRef.id;
};

export const getUserTasks = async (userId: string) => {
  const tasksRef = collection(db, 'tasks');
  const q = query(
    tasksRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateTask = async (taskId: string, data: Partial<any>) => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// 每日计划相关
export const createDailyPlan = async (userId: string, dateStr: string, plan: any) => {
  const planRef = doc(db, 'dailyPlans', `${userId}_${dateStr}`);
  await setDoc(planRef, {
    userId,
    date: dateStr,
    ...plan,
    createdAt: serverTimestamp(),
  });
};

export const getDailyPlan = async (userId: string, dateStr: string) => {
  const planRef = doc(db, 'dailyPlans', `${userId}_${dateStr}`);
  const planSnap = await getDoc(planRef);
  if (planSnap.exists()) {
    return planSnap.data();
  }
  return null;
};

// 生成每日计划（模拟后端算法）
export const generateDailyPlan = async (userId: string, _dateStr: string, energyLevel: number) => {
  // 获取用户画像
  const profile = await getUserProfile(userId);
  // 获取用户任务池
  const tasks = await getUserTasks(userId);
  
  if (!profile || tasks.length === 0) {
    return null;
  }

  // 简单的任务生成算法
  const planTasks: any[] = [];
  let currentTime = new Date();
  currentTime.setHours(9, 0, 0, 0); // 从9点开始
  
  // 根据能量级别筛选任务
  let filteredTasks = tasks;
  if (energyLevel <= 2) {
    filteredTasks = tasks.filter((t: any) => t.energyLevel === 'low' || t.type === 'basic');
  } else if (energyLevel <= 4) {
    filteredTasks = tasks.filter((t: any) => t.energyLevel !== 'high');
  }
  
  // 选择前N个任务
  const selectedTasks = filteredTasks.slice(0, profile.targetMajorTasks || 5);
  
  selectedTasks.forEach((task: any, index: number) => {
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
      colorHex: task.colorHex || getTaskColor(index),
      estimatedMinutes,
      status: 'todo' as const,
    };
    
    // 添加休息时间
    currentTime = new Date(endTime.getTime() + (profile.pomodoroPref?.[0] || 5) * 60000);
    
    planTasks.push(planTask);
  });
  
  return {
    tasks: planTasks,
    totalEstimatedMinutes: planTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
    version: 1,
  };
};

// 计时日志相关
export const createTimerLog = async (log: any) => {
  const logsRef = collection(db, 'timerLogs');
  const logRef = doc(logsRef);
  await setDoc(logRef, {
    ...log,
    createdAt: serverTimestamp(),
  });
  return logRef.id;
};

export const updateTimerLog = async (logId: string, data: Partial<any>) => {
  const logRef = doc(db, 'timerLogs', logId);
  await updateDoc(logRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// 订阅相关
export const getUserSubscription = async (userId: string) => {
  const subsRef = collection(db, 'subscriptions');
  const q = query(
    subsRef,
    where('userId', '==', userId),
    where('status', 'in', ['active', 'trial']),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }
  return null;
};

// 统计数据相关
export const getUserStats = async (userId: string) => {
  const statsRef = doc(db, 'userStats', userId);
  const statsSnap = await getDoc(statsRef);
  if (statsSnap.exists()) {
    return statsSnap.data();
  }
  return null;
};

export const updateUserStats = async (userId: string, data: Partial<any>) => {
  const statsRef = doc(db, 'userStats', userId);
  await setDoc(statsRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

// 获取任务颜色
function getTaskColor(index: number): string {
  const colors = [
    '#FF6B6B', '#FFD93D', '#00D26A', '#4ECDC4', '#95E1D3',
    '#F38181', '#AA96DA', '#FCBAD3', '#A8E6CF', '#FFD3B6'
  ];
  return colors[index % colors.length];
}

export { onAuthStateChanged, type FirebaseUser };
