import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';

export function SubmitAchievement() {
  const {
    submitAchievement
  } = useApp();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearForm = () => {
    setTitle('');
    setCategory('');
    setDate('');
    setDescription('');
    setEvidenceFile(null);
    document.getElementById('evidence').value = '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title || !category || !date || !description) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    const success = await submitAchievement({ title, category, date, description, evidenceFile });
    if (success) clearForm();
    setIsSubmitting(false);
  };

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) { setEvidenceFile(null); return; }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please choose a file smaller than 5MB');
      e.target.value = '';
      setEvidenceFile(null);
      return;
    }
    setEvidenceFile(file);
    toast.info(`File selected: ${file.name}`);
  };

  return <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Submit New Achievement</h3>
        <p className="text-gray-600 mb-6">Submit your achievements for review and approval</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="achievementTitle" className="text-gray-700 font-medium">
              Achievement Title *
            </Label>
            <Input id="achievementTitle" type="text" placeholder="e.g., Science Fair Winner" value={title} onChange={e => setTitle(e.target.value)} className="border-gray-300 focus:border-[#4361ee] focus:ring-[#4361ee]" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-700 font-medium">
                Category *
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="border-gray-300 focus:border-[#4361ee] focus:ring-[#4361ee]">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="arts">Arts & Culture</SelectItem>
                  <SelectItem value="community">Community Service</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="technical">Technical/IT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-gray-700 font-medium">
                Date of Achievement *
              </Label>
              <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="border-gray-300 focus:border-[#4361ee] focus:ring-[#4361ee]" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 font-medium">
              Description *
            </Label>
            <Textarea id="description" rows={5} placeholder="Provide details about your achievement, including any relevant context, impact, and accomplishments..." value={description} onChange={e => setDescription(e.target.value)} className="border-gray-300 focus:border-[#4361ee] focus:ring-[#4361ee] resize-none" required />
            <p className="text-xs text-gray-500">Minimum 50 characters recommended</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence" className="text-gray-700 font-medium">
              Upload Evidence (Certificate, Photo, Document)
            </Label>
            <Input id="evidence" type="file" onChange={handleFileChange} className="border-gray-300 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#4361ee] file:text-white file:cursor-pointer hover:file:bg-[#3451d4]" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
            <p className="text-xs text-gray-500">Accepted formats: PDF, JPG, PNG, DOC (Max 5MB)</p>
            {evidenceFile && <p className="text-sm text-green-600 mt-1">Selected: {evidenceFile.name}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="bg-[#4361ee] text-white hover:bg-[#3451d4] px-6" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Achievement'}
            </Button>
            <Button type="button" variant="outline" className="border-gray-300" onClick={() => {
            clearForm();
            toast.info('Form cleared');
          }}>
              Clear Form
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Submission Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Provide accurate and detailed information about your achievement</li>
          <li>Upload supporting evidence to expedite the approval process</li>
          <li>Achievements typically reviewed within 3-5 business days</li>
          <li>You'll receive a notification once your submission is reviewed</li>
        </ul>
      </div>
    </div>;
}
