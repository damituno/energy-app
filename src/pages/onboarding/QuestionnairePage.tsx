import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Sparkles
} from 'lucide-react';
import { questions } from '@/data/questions';
import type { QuestionnaireAnswers } from '@/types';

interface QuestionnairePageProps {
  onComplete: () => void;
}

export function QuestionnairePage({ onComplete }: QuestionnairePageProps) {
  const { completeQuestionnaire, generatePlan } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  
  const currentAnswer = answers[currentQuestion.field];
  const hasAnswer = currentAnswer !== undefined && 
    (Array.isArray(currentAnswer) 
      ? (currentAnswer as string[]).length > 0 
      : true);

  const handleSelect = (value: string) => {
    if (currentQuestion.type === 'multiple') {
      const currentValues = (answers[currentQuestion.field] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setAnswers({ ...answers, [currentQuestion.field]: newValues });
    } else {
      setAnswers({ ...answers, [currentQuestion.field]: value });
    }
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      setIsSubmitting(true);
      // 转换答案格式
      const formattedAnswers: QuestionnaireAnswers = {
        taskTypes: (answers.taskTypes as string[] || []).map(v => v as any),
        preferredTime: (answers.preferredTime as any) || 'any',
        focusCapacityMinutes: parseInt(answers.focusCapacityMinutes as unknown as string) || 30,
        targetMajorTasks: parseInt(answers.targetMajorTasks as unknown as string) || 3,
        lowStatePref: (answers.lowStatePref as any) || 'keep_base',
        completionStyle: (answers.completionStyle as any) || 'planner',
        pomodoroPref: (answers.pomodoroPref || [25]) as number[],
        stressSources: (answers.stressSources as string[] || []),
        reminderFrequency: (answers.reminderFrequency as any) || 'medium',
        monthPlanOptIn: (answers.monthPlanOptIn as boolean) || false,
      };
      
      await completeQuestionnaire(formattedAnswers);
      await generatePlan();
      setIsSubmitting(false);
      onComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const canSkip = !currentQuestion.options.some(o => o.value === 'none');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 顶部进度 */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-2 rounded-full hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {questions.length}
          </span>
          <div className="w-10" /> {/* 占位 */}
        </div>
        
        {/* 进度条 */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      {/* 问题内容 */}
      <div className="flex-1 px-6 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* 问题标题 */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {currentQuestion.title}
              </h2>
              <p className="text-muted-foreground">
                {currentQuestion.description}
              </p>
            </div>

            {/* 选项 */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = currentQuestion.type === 'multiple'
                  ? ((answers[currentQuestion.field] as string[]) || []).includes(option.value)
                  : answers[currentQuestion.field] === option.value;

                return (
                  <motion.button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {option.label}
                        </p>
                        {option.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.description}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* 用途说明 */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>此题用于 {currentQuestion.purpose}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部按钮 */}
      <div className="px-6 pb-8 pt-4 space-y-3">
        {canSkip && (
          <button
            onClick={handleNext}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            跳过此题
          </button>
        )}
        <Button
          onClick={handleNext}
          disabled={!hasAnswer || isSubmitting}
          className="w-full h-14 text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              生成计划中...
            </>
          ) : (
            <>
              {isLastQuestion ? '完成' : '下一题'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
