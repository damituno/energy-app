import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { 
  Moon, 
  Sun, 
  Bell, 
  Clock, 
  Target, 
  Sliders,
  Palette,
  Volume2,
  Database,
  Share2,
  HelpCircle,
  ChevronRight,
  User
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SettingItemProps {
  icon: typeof Moon;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  delay?: number;
}

function SettingItem({ icon: Icon, title, subtitle, children, onClick, delay = 0 }: SettingItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-2xl bg-card/50 border border-border/50 ${
        onClick ? 'cursor-pointer hover:bg-card transition-colors' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">{title}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

export function SettingsPage() {
  const { state, toggleTheme, updateSettings } = useApp();
  const { settings, isDarkMode } = state;
  const [showDataDialog, setShowDataDialog] = useState(false);

  const handleExportData = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `energy-app-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          alert('数据导入功能需要在实际应用中实现');
        } catch (error) {
          alert('文件格式错误');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold text-foreground">设置</h1>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
      </motion.div>

      {/* 用户信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 border border-primary/20"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
            😊
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">默认昵称</h2>
            <p className="text-sm text-muted-foreground">会员体验期已过</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              满怀希望，就能所向披靡
            </p>
          </div>
        </div>
      </motion.div>

      {/* 外观设置 */}
      <div className="space-y-3">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium text-muted-foreground px-1"
        >
          外观
        </motion.h3>
        <SettingItem
          icon={isDarkMode ? Moon : Sun}
          title="深色模式"
          subtitle={isDarkMode ? '已开启' : '已关闭'}
          delay={0.25}
        >
          <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
        </SettingItem>
        <SettingItem
          icon={Palette}
          title="主题颜色"
          subtitle="默认"
          delay={0.3}
          onClick={() => alert('主题颜色功能开发中')}
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </SettingItem>
      </div>

      {/* 任务设置 */}
      <div className="space-y-3">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm font-medium text-muted-foreground px-1"
        >
          任务设置
        </motion.h3>
        
        {/* 番茄钟时长 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-2xl bg-card/50 border border-border/50 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">番茄钟时长</p>
              <p className="text-sm text-muted-foreground">{settings.pomodoroDuration} 分钟</p>
            </div>
          </div>
          <Slider
            value={[settings.pomodoroDuration]}
            onValueChange={([value]) => updateSettings({ pomodoroDuration: value })}
            min={15}
            max={60}
            step={5}
          />
        </motion.div>

        {/* 休息间隔 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
          className="p-4 rounded-2xl bg-card/50 border border-border/50 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">休息间隔</p>
              <p className="text-sm text-muted-foreground">{settings.breakInterval} 分钟</p>
            </div>
          </div>
          <Slider
            value={[settings.breakInterval]}
            onValueChange={([value]) => updateSettings({ breakInterval: value })}
            min={3}
            max={15}
            step={1}
          />
        </motion.div>

        {/* 每日目标 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-2xl bg-card/50 border border-border/50 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">每日目标分数</p>
              <p className="text-sm text-muted-foreground">{settings.dailyGoalPoints} 分</p>
            </div>
          </div>
          <Slider
            value={[settings.dailyGoalPoints]}
            onValueChange={([value]) => updateSettings({ dailyGoalPoints: value })}
            min={30}
            max={100}
            step={10}
          />
        </motion.div>
      </div>

      {/* 通知设置 */}
      <div className="space-y-3">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-sm font-medium text-muted-foreground px-1"
        >
          通知
        </motion.h3>
        <SettingItem
          icon={Bell}
          title="推送通知"
          subtitle={settings.notifications ? '已开启' : '已关闭'}
          delay={0.6}
        >
          <Switch 
            checked={settings.notifications} 
            onCheckedChange={(checked) => updateSettings({ notifications: checked })} 
          />
        </SettingItem>
        <SettingItem
          icon={Volume2}
          title="声音提醒"
          subtitle="开启"
          delay={0.65}
        >
          <Switch checked={true} onCheckedChange={() => {}} />
        </SettingItem>
      </div>

      {/* 数据管理 */}
      <div className="space-y-3">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm font-medium text-muted-foreground px-1"
        >
          数据
        </motion.h3>
        <SettingItem
          icon={Database}
          title="数据管理"
          subtitle="备份与恢复"
          delay={0.75}
          onClick={() => setShowDataDialog(true)}
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </SettingItem>
        <SettingItem
          icon={Share2}
          title="分享应用"
          delay={0.8}
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: '能量管理',
                text: '一款基于能量管理的任务应用',
                url: window.location.href,
              });
            } else {
              alert('分享功能需要在支持的设备上使用');
            }
          }}
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </SettingItem>
      </div>

      {/* 关于 */}
      <div className="space-y-3">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="text-sm font-medium text-muted-foreground px-1"
        >
          关于
        </motion.h3>
        <SettingItem
          icon={HelpCircle}
          title="帮助与反馈"
          delay={0.9}
          onClick={() => alert('帮助功能开发中')}
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </SettingItem>
      </div>

      {/* 版本信息 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-xs text-muted-foreground/60 pt-4"
      >
        <p>能量管理 v1.0.0</p>
        <p className="mt-1">Made with ❤️ for better productivity</p>
      </motion.div>

      {/* 数据管理对话框 */}
      <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>数据管理</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-xl bg-muted/50 space-y-2">
              <h4 className="font-medium">导出数据</h4>
              <p className="text-sm text-muted-foreground">
                将所有数据导出为 JSON 文件，用于备份
              </p>
              <Button onClick={handleExportData} className="w-full">
                导出备份
              </Button>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 space-y-2">
              <h4 className="font-medium">导入数据</h4>
              <p className="text-sm text-muted-foreground">
                从备份文件恢复数据
              </p>
              <Label className="w-full">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
                <div className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground text-center cursor-pointer hover:bg-primary/90 transition-colors">
                  选择文件
                </div>
              </Label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
