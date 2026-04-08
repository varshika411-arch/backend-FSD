import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
export function Profile() {
  const {
    currentUser,
    updateProfile
  } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [year, setYear] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [bio, setBio] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setDepartment(currentUser.department || '');
      setStudentId(currentUser.studentId || currentUser.student_id || '');
      setYear(currentUser.year || '');
      setCgpa(currentUser.cgpa || '');
      setBio(currentUser.bio || '');
      setDateOfBirth(currentUser.dateOfBirth || currentUser.date_of_birth || '');
    }
  }, [currentUser]);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }
    await updateProfile({
      name: fullName,
      phone,
      department,
      year,
      cgpa,
      bio,
      dateOfBirth
    });
  };
  return <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h3>
        <p className="text-gray-600 mb-6">Manage your personal information</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name *</Label>
              <Input id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="border-gray-300 focus:border-[#4361ee] focus:ring-[#4361ee]" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId" className="text-gray-700 font-medium">Student ID</Label>
              <Input id="studentId" type="text" value={studentId} disabled className="bg-gray-50 border-gray-300" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input id="email" type="email" value={email} disabled className="bg-gray-50 border-gray-300 cursor-not-allowed" />
              <p className="text-xs text-gray-400">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-medium">Phone</Label>
              <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="border-gray-300 focus:border-[#4361ee] focus:ring-[#4361ee]" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-gray-700 font-medium">Department/Field of Study *</Label>
              <Input id="department" type="text" value={department} onChange={e => setDepartment(e.target.value)} className="border-gray-300 focus:border-[#4361ee] focus:ring-[#4361ee]" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="text-gray-700 font-medium">Academic Year *</Label>
              <select id="year" value={year} onChange={e => setYear(e.target.value)} className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee] focus:ring-offset-0">
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cgpa" className="text-gray-700 font-medium">CGPA</Label>
              <Input id="cgpa" type="text" value={cgpa} onChange={e => setCgpa(e.target.value)} className="border-gray-300 focus:border-[#4361ee] focus:ring-[#4361ee]" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-gray-700 font-medium">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="border-gray-300 focus:border-[#4361ee] focus:ring-[#4361ee]" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-700 font-medium">Bio</Label>
              <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} className="border-gray-300 focus:border-[#4361ee] focus:ring-[#4361ee]" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="bg-[#4361ee] text-white hover:bg-[#3451d4] px-6">
              Update Profile
            </Button>
            <Button type="button" variant="outline" className="border-gray-300" onClick={() => {
            setFullName(currentUser?.name || '');
            setPhone(currentUser?.phone || '');
            setDepartment(currentUser?.department || '');
            setYear(currentUser?.year || '');
            setCgpa(currentUser?.cgpa || '');
            setBio(currentUser?.bio || '');
            setDateOfBirth(currentUser?.dateOfBirth || currentUser?.date_of_birth || '');
            toast.info('Changes reset');
          }}>
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>;
}
