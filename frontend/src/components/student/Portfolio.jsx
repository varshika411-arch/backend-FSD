import { useState } from 'react';
import { Plus, ExternalLink, Trash2, Edit, Briefcase } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
export function Portfolio() {
  const {
    portfolio,
    addPortfolioItem,
    deletePortfolioItem
  } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [link, setLink] = useState('');
  const [date, setDate] = useState('');
  const handleSubmit = async e => {
    e.preventDefault();
    const success = await addPortfolioItem({
      title,
      description,
      category,
      link,
      date
    });
    if (success) {
      setTitle('');
      setDescription('');
      setCategory('');
      setLink('');
      setDate('');
      setIsAddDialogOpen(false);
    }
  };
  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deletePortfolioItem(id);
    }
  };
  const getCategoryColor = category => {
    const colors = {
      'Project': 'bg-blue-100 text-blue-800',
      'Certification': 'bg-green-100 text-green-800',
      'Publication': 'bg-purple-100 text-purple-800',
      'Award': 'bg-yellow-100 text-yellow-800',
      'Research': 'bg-red-100 text-red-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };
  const sortedPortfolio = [...portfolio].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">My Portfolio</h3>
            <p className="text-gray-600">Showcase your projects, certifications, and accomplishments</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#4361ee] hover:bg-[#3451d4] gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#4361ee]">Add Portfolio Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="portfolioTitle">Title *</Label>
                  <Input id="portfolioTitle" type="text" placeholder="e.g., E-commerce Website Development" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolioCategory">Category *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Project">Project</SelectItem>
                      <SelectItem value="Certification">Certification</SelectItem>
                      <SelectItem value="Publication">Publication</SelectItem>
                      <SelectItem value="Award">Award</SelectItem>
                      <SelectItem value="Research">Research</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolioDate">Date *</Label>
                  <Input id="portfolioDate" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolioDescription">Description *</Label>
                  <Textarea id="portfolioDescription" rows={4} placeholder="Describe your work, technologies used, and key achievements..." value={description} onChange={e => setDescription(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolioLink">Link (Optional)</Label>
                  <Input id="portfolioLink" type="url" placeholder="https://example.com" value={link} onChange={e => setLink(e.target.value)} />
                  <p className="text-xs text-gray-500">Link to project, certificate, or documentation</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-[#4361ee] hover:bg-[#3451d4]">
                    Add to Portfolio
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {sortedPortfolio.length === 0 ? <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No Portfolio Items Yet</h4>
            <p className="text-gray-500 mb-4">Start building your portfolio by adding your projects and achievements</p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-[#4361ee] hover:bg-[#3451d4] gap-2">
              <Plus className="h-4 w-4" />
              Add First Item
            </Button>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPortfolio.map(item => <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
              })}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {item.description}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                  {item.link ? <Button variant="outline" size="sm" className="gap-2 flex-1 mr-2" onClick={() => window.open(item.link, '_blank')}>
                      <ExternalLink className="h-4 w-4" />
                      View
                    </Button> : <div className="flex-1"></div>}
                  <Button variant="destructive" size="sm" className="gap-2" onClick={() => handleDelete(item.id, item.title)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>)}
          </div>}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Portfolio Tips</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Include links to live projects or GitHub repositories</li>
          <li>Highlight the technologies and skills you used</li>
          <li>Add certifications from recognized platforms</li>
          <li>Showcase your best work to stand out</li>
        </ul>
      </div>
    </div>;
}
