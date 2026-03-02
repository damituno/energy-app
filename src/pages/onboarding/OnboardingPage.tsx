import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Zap, 
  Crown,
  ChevronRight,
  SkipForward
} from 'lucide-react';

const slides = [
  {
    icon: Sparkles,
    title: '自动任务生成',
    description: '根据你的能量状态和时间偏好，智能生成每日任务计划',
    color: 'from-blue-400 to-cyan-400',
  },
  {
    icon: Zap,
    title: '状态驱动任务量',
    description: '状态差时只做基础任务，状态好时挑战高难度任务',
    color: 'from-yellow-400 to-orange-400',
  },
  {
    icon: Crown,
    title: 'VIP 特权',
    description: '解锁高级统计、数据导出、月视图等专属功能',
    color: 'from-purple-400 to-pink-400',
  },
];

export function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { state, dispatch } = useApp();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      // 最后一页，标记引导完成
      // 保持 isNewUser 为 true，但引导已完成
      // 这会触发重新渲染，进入问卷页面
      if (state.user) {
        dispatch({
          type: 'SET_USER',
          payload: { ...state.user, isNewUser: false }
        });
      }
    }
  };

  const skipOnboarding = () => {
    // 跳过引导，直接进入问卷
    if (state.user) {
      dispatch({
        type: 'SET_USER',
        payload: { ...state.user, isNewUser: false }
      });
    }
  };

  const CurrentIcon = slides[currentSlide].icon;
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 跳过按钮 */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={skipOnboarding}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          跳过
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* 进度指示器 */}
      <div className="absolute top-4 left-4 right-20 flex gap-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all ${
              index <= currentSlide ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* 图标 */}
            <div className={`w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center shadow-2xl`}>
              <CurrentIcon className="w-16 h-16 text-white" />
            </div>

            {/* 标题 */}
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {slides[currentSlide].title}
            </h2>

            {/* 描述 */}
            <p className="text-muted-foreground text-lg max-w-xs mx-auto">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部按钮 */}
      <div className="px-8 pb-12">
        <Button
          onClick={nextSlide}
          className="w-full h-14 text-lg"
        >
          {!isLastSlide ? (
            <>
              下一步
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            '开始体验'
          )}
        </Button>
      </div>
    </div>
  );
}
