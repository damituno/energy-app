// 🔥 Fake Firebase Mode - 用于本地构建APK（无后端）

export const auth = {};
export const db = {};

// 所有函数变为空实现，防止报错

export const createUser = async () => {};
export const getUser = async () => null;
export const updateUser = async () => {};

export const createUserProfile = async () => {};
export const getUserProfile = async () => null;

export const createTask = async () => "local-task-id";
export const getUserTasks = async () => [];
export const updateTask = async () => {};

export const createDailyPlan = async () => {};
export const getDailyPlan = async () => null;
export const generateDailyPlan = async () => null;

export const createTimerLog = async () => "log-id";
export const updateTimerLog = async () => {};

export const getUserSubscription = async () => null;

export const getUserStats = async () => null;
export const updateUserStats = async () => {};

export const onAuthStateChanged = (_auth: any, _callback: (user: any) => void) => {
  return () => {};
};
export type FirebaseUser = any;