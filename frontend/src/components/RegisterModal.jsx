import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
export function RegisterModal({
  isOpen,
  onClose,
  onRegister,
  onShowLogin
}) {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    const sanitizedRole = role.trim().toLowerCase();
    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPhone = phone.trim();
    if (!sanitizedRole || !sanitizedName || !sanitizedEmail || !password || !confirmPassword || !sanitizedPhone) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    const success = await onRegister({
      role: sanitizedRole,
      name: sanitizedName,
      email: sanitizedEmail,
      password,
      phone: sanitizedPhone
    });
    setIsLoading(false);
    if (success) {
      setRole('student');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhone('');
    }
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{
          color: '#4361ee'
        }}>
            Create an Account
          </DialogTitle>
          <DialogDescription>
            Sign up to start tracking your achievements
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="registerRole">Register As</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="registerRole">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registerName">Full Name</Label>
            <Input id="registerName" type="text" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registerEmail">Email</Label>
            <Input id="registerEmail" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registerPassword">Password</Label>
            <Input id="registerPassword" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registerConfirmPassword">Confirm Password</Label>
            <Input id="registerConfirmPassword" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registerPhone">Phone Number</Label>
            <Input id="registerPhone" type="tel" placeholder="Enter your phone number" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          <Button type="submit" className="w-full bg-[#4cc9f0] text-white hover:bg-[#3aa8d4]" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>

          <p className="text-center">
            Already have an account?{' '}
            <button type="button" onClick={onShowLogin} className="text-[#4361ee] hover:underline">
              Login here
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>;
}
