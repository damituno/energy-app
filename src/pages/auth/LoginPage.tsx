import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Phone, 
  MessageSquare, 
  ArrowRight,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export function LoginPage() {
  const { login } = useApp();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async () => {
    if (phone.length !== 11) return;
    
    setIsLoading(true);
    // 模拟发送验证码
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep('code');
    setCountdown(60);
    
    // 倒计时
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async () => {
    if (code.length !== 6) return;
    
    setIsLoading(true);
    await login(phone);
    setIsLoading(false);
  };

  const isPhoneValid = phone.length === 11 && /^1[3-9]\d{9}$/.test(phone);
  const isCodeValid = code.length === 6;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 顶部装饰 */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-5xl shadow-2xl shadow-primary/30">
            ⚡
          </div>
        </motion.div>
        {/* 装饰圆环 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-primary/20 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-primary/10 rounded-full"
        />
      </div>

      {/* 内容区域 */}
      <div className="flex-1 px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">欢迎使用能量管理</h1>
          <p className="text-muted-foreground">根据你的能量状态，智能规划每一天</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label className="text-muted-foreground">手机号登录</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="请输入手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className="pl-10 h-14 text-lg"
                    maxLength={11}
                  />
                </div>
                {phone.length > 0 && !isPhoneValid && (
                  <p className="text-sm text-destructive">请输入正确的手机号</p>
                )}
              </div>

              <Button
                onClick={handleSendCode}
                disabled={!isPhoneValid || isLoading}
                className="w-full h-14 text-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    获取验证码
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              {/* 微信登录选项 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-background text-muted-foreground">或使用</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-14"
                onClick={() => alert('微信登录功能需要接入微信SDK')}
              >
                <MessageSquare className="w-5 h-5 mr-2 text-green-500" />
                微信登录
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <p className="text-muted-foreground">
                  验证码已发送至 <span className="text-foreground font-medium">{phone}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">验证码</Label>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={code[index] || ''}
                      onChange={(e) => {
                        const newCode = code.split('');
                        newCode[index] = e.target.value;
                        setCode(newCode.join('').slice(0, 6));
                        // 自动聚焦下一个
                        if (e.target.value && index < 5) {
                          const nextInput = e.target.parentElement?.nextElementSibling?.querySelector('input');
                          nextInput?.focus();
                        }
                      }}
                      className="w-12 h-14 text-center text-2xl font-bold"
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={handleLogin}
                disabled={!isCodeValid || isLoading}
                className="w-full h-14 text-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    登录
                    <CheckCircle2 className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setStep('phone')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  更换手机号
                </button>
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    {countdown} 秒后重新发送
                  </p>
                ) : (
                  <button
                    onClick={handleSendCode}
                    className="text-sm text-primary hover:underline mt-2"
                  >
                    重新发送验证码
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部协议 */}
      <div className="px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          登录即表示同意
          <button className="text-primary hover:underline mx-1">用户协议</button>
          和
          <button className="text-primary hover:underline mx-1">隐私政策</button>
        </p>
      </div>
    </div>
  );
}
