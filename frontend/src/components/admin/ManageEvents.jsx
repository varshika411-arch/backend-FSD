import { useState } from 'react';
import { Calendar, Plus, Edit, Trash2, MapPin, Clock, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
export function ManageEvents() {
  const {
    events,
    createEvent,
    updateEvent,
    deleteEvent
  } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [category, setCategory] = useState('');
  const [organizer, setOrganizer] = useState('');
  const handleOpenDialog = event => {
    if (event) {
      setEditingEvent(event);
      setTitle(event.title);
      setDescription(event.description);
      setDate(event.date);
      setTime(event.time);
      setLocation(event.location);
      setMaxParticipants(event.maxParticipants.toString());
      setCategory(event.category);
      setOrganizer(event.organizer || '');
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };
  const resetForm = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setLocation('');
    setMaxParticipants('');
    setCategory('');
    setOrganizer('');
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!title || !description || !date || !time || !location || !maxParticipants || !category) {
      toast.error('Please fill in all required fields');
      return;
    }
    const eventData = {
      title,
      description,
      date,
      time,
      location,
      maxParticipants: parseInt(maxParticipants),
      category,
      organizer: organizer || 'Admin',
      status: 'upcoming'
    };
    if (editingEvent) {
      await updateEvent(editingEvent.id, eventData);
    } else {
      await createEvent(eventData);
    }
    setIsDialogOpen(false);
    resetForm();
  };
  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteEvent(id);
    }
  };
  const getCategoryColor = category => {
    const colors = {
      'Academic': 'bg-blue-100 text-blue-800',
      'Sports': 'bg-green-100 text-green-800',
      'Cultural': 'bg-purple-100 text-purple-800',
      'Technical': 'bg-orange-100 text-orange-800',
      'Workshop': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };
  return <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Manage Events</h3>
            <p className="text-gray-600">Create and manage university events</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-[#4361ee] hover:bg-[#3451d4] gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#4361ee]">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Annual Tech Symposium 2026" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the event..." required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Main Auditorium" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants *</Label>
                    <Input id="maxParticipants" type="number" value={maxParticipants} onChange={e => setMaxParticipants(e.target.value)} placeholder="e.g., 200" min="1" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Cultural">Cultural</SelectItem>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizer">Organizer</Label>
                  <Input id="organizer" value={organizer} onChange={e => setOrganizer(e.target.value)} placeholder="e.g., CS Department" />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-[#4361ee] hover:bg-[#3451d4]">
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {events.length === 0 ? <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center mb-4">No events created yet</p>
              <Button onClick={() => handleOpenDialog()} className="bg-[#4361ee] hover:bg-[#3451d4] gap-2">
                <Plus className="h-4 w-4" />
                Create First Event
              </Button>
            </CardContent>
          </Card> : <div className="grid gap-4">
            {events.map(event => <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                      </div>
                      <CardDescription>{event.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className={event.registeredCount >= event.maxParticipants ? 'text-red-600 font-semibold' : ''}>
                        {event.registeredCount} / {event.maxParticipants} participants
                      </span>
                    </div>
                  </div>

                  {event.organizer && <div className="text-sm text-gray-600 mb-3">
                      <span className="font-semibold">Organized by:</span> {event.organizer}
                    </div>}

                  {event.registeredStudents.length > 0 && <div className="text-sm text-gray-600">
                      <span className="font-semibold">Registered Students:</span>{' '}
                      {event.registeredStudents.slice(0, 3).join(', ')}
                      {event.registeredStudents.length > 3 && ` +${event.registeredStudents.length - 3} more`}
                    </div>}

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(event)} className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(event.id, event.title)} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </div>
    </div>;
}
