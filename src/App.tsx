import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { AppProvider, useApp } from '@/context/AppContext';
import { LoginPage } from '@/pages/auth/LoginPage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';
import { QuestionnairePage } from '@/pages/onboarding/QuestionnairePage';
import { BottomNav } from '@/components/BottomNav';
import { HomePage } from '@/pages/HomePage';
import { TasksPage } from '@/pages/TasksPage';
import { StatsPage } from '@/pages/StatsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import './App.css';

// 页面切换动画
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const pageTransition: Transition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
};

// 主应用内容
function AppContent() {
  const [currentTab, setCurrentTab] = useState('home');
  const { state } = useApp();
  const { isDarkMode, isAuthenticated, user, isLoading } = state;

  // 应用主题
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // 未登录显示登录页
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // 新用户显示引导页
  if (user?.isNewUser) {
    return (
      <OnboardingPage
        onComplete={() => {}}
        onSkip={() => {}}
      />
    );
  }

  // 未完成问卷显示问卷页
  if (!user?.hasCompletedQuestionnaire) {
    return (
      <QuestionnairePage
        onComplete={() => {}}
      />
    );
  }

  const renderPage = () => {
    switch (currentTab) {
      case 'home':
        return (
          <motion.div
            key="home"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <HomePage />
          </motion.div>
        );
      case 'tasks':
        return (
          <motion.div
            key="tasks"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <TasksPage />
          </motion.div>
        );
      case 'stats':
        return (
          <motion.div
            key="stats"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <StatsPage />
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div
            key="settings"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <SettingsPage />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 主内容区域 */}
      <main className="max-w-md mx-auto px-4 pt-6 pb-24">
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </main>

      {/* 底部导航 */}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
}

// 根组件
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
