import { useState } from 'react';
import { Users, Search, Trash2, Mail, Phone, Pencil } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useApp } from '../../contexts/AppContext';
export function ManageStudents() {
  const {
    users,
    updateStudent,
    deleteUser
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    phone: '',
    department: '',
    year: '',
    cgpa: '',
    bio: ''
  });
  const filteredStudents = users.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.studentId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const openEditDialog = student => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      studentId: student.studentId || student.student_id || '',
      phone: student.phone || '',
      department: student.department || '',
      year: student.year || '',
      cgpa: student.cgpa || '',
      bio: student.bio || ''
    });
    setIsEditDialogOpen(true);
  };
  const handleChange = (field, value) => {
    setFormData(current => ({
      ...current,
      [field]: value
    }));
  };
  const handleUpdate = async () => {
    if (!editingStudent) return;
    const success = await updateStudent(editingStudent.id, formData);
    if (success) {
      setIsEditDialogOpen(false);
      setEditingStudent(null);
    }
  };
  const handleDialogChange = open => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingStudent(null);
    }
  };
  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete student "${name}"? This action cannot be undone.`)) {
      await deleteUser(id);
    }
  };
  return <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Manage Students</h3>
          <p className="text-gray-600 mb-4">View and manage all registered students</p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input type="text" placeholder="Search by name, email, or student ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </div>

        {filteredStudents.length === 0 ? <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center">
                {searchTerm ? 'No students found matching your search' : 'No students registered yet'}
              </p>
            </CardContent>
          </Card> : <div className="grid gap-4">
            {filteredStudents.map(student => <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{student.name}</CardTitle>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {(student.role || 'student').charAt(0).toUpperCase() + (student.role || 'student').slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>
                        {student.studentId && <span className="font-semibold">ID: {student.studentId}</span>}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{student.email}</span>
                    </div>
                    {student.phone && <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{student.phone}</span>
                      </div>}
                    {student.department && <div className="text-sm">
                        <span className="font-semibold">Department:</span> {student.department}
                      </div>}
                    {student.year && <div className="text-sm">
                        <span className="font-semibold">Year:</span> {student.year}
                      </div>}
                    {student.cgpa && <div className="text-sm">
                        <span className="font-semibold">CGPA:</span> {student.cgpa}
                      </div>}
                  </div>

                  {student.bio && <div className="mt-3 text-sm text-gray-600">
                      <span className="font-semibold">Bio:</span> {student.bio}
                    </div>}

                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(student)} className="gap-2">
                      <Pencil className="h-4 w-4" />
                      Edit Student
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(student.id, student.name)} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Student
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </div>}

        {filteredStudents.length > 0 && <div className="mt-6 text-sm text-gray-600 text-center">
            Showing {filteredStudents.length} of {users.length} student(s)
          </div>}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
          ⚠️ Warning
        </h4>
        <p className="text-sm text-yellow-800">
          Deleting a student will permanently remove all their data including achievements, portfolio items, and event registrations. This action cannot be undone.
        </p>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student Details</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student-name">Name</Label>
              <Input id="student-name" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-email">Email</Label>
              <Input id="student-email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-id">Student ID</Label>
              <Input id="student-id" value={formData.studentId} onChange={e => handleChange('studentId', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-phone">Phone</Label>
              <Input id="student-phone" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-department">Department</Label>
              <Input id="student-department" value={formData.department} onChange={e => handleChange('department', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-year">Year</Label>
              <Input id="student-year" value={formData.year} onChange={e => handleChange('year', e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="student-cgpa">CGPA</Label>
              <Input id="student-cgpa" value={formData.cgpa} onChange={e => handleChange('cgpa', e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="student-bio">Bio</Label>
              <Textarea id="student-bio" rows={4} value={formData.bio} onChange={e => handleChange('bio', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="bg-[#4361ee] hover:bg-[#3451d4]">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}
