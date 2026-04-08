import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

function generateCaptcha() {
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b;
  if (op === '+') { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1; }
  else if (op === '-') { a = Math.floor(Math.random() * 20) + 10; b = Math.floor(Math.random() * 10) + 1; }
  else { a = Math.floor(Math.random() * 9) + 2; b = Math.floor(Math.random() * 9) + 2; }
  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  return { question: `${a} ${op} ${b}`, answer };
}

export function LoginModal({ isOpen, onClose, onLogin, onShowRegister, defaultEmail = '' }) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
    setCaptchaError('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail || '');
      setPassword('');
      refreshCaptcha();
    }
  }, [defaultEmail, isOpen, refreshCaptcha]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (captchaInput.trim() === '' || parseInt(captchaInput, 10) !== captcha.answer) {
      setCaptchaError('Incorrect CAPTCHA answer. Please try again.');
      refreshCaptcha();
      return;
    }
    setIsLoading(true);
    await onLogin(email, password);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{ color: '#4361ee' }}>
            Login to AchieveTrack
          </DialogTitle>
          <DialogDescription>
            Enter your credentials to access your dashboard
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="loginEmail">Email</Label>
            <Input id="loginEmail" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loginPassword">Password</Label>
            <Input id="loginPassword" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>CAPTCHA Verification</Label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="font-mono text-lg font-bold text-[#4361ee] select-none tracking-widest">
                {captcha.question} = ?
              </span>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="ml-auto text-gray-400 hover:text-[#4361ee] transition-colors"
                title="Refresh CAPTCHA"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <Input
              id="captchaInput"
              type="number"
              placeholder="Enter the answer"
              value={captchaInput}
              onChange={e => { setCaptchaInput(e.target.value); setCaptchaError(''); }}
              required
            />
            {captchaError && <p className="text-sm text-red-500">{captchaError}</p>}
          </div>

          <Button type="submit" className="w-full bg-[#4cc9f0] text-white hover:bg-[#3aa8d4]" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

          <p className="text-center">
            Don't have an account?{' '}
            <button type="button" onClick={onShowRegister} className="text-[#4361ee] hover:underline">
              Register here
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
