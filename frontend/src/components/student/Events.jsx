import { useState } from 'react';
import { Calendar, MapPin, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
export function Events() {
  const [filter, setFilter] = useState('all');
  const {
    events,
    currentUser,
    registerForEvent,
    unregisterFromEvent
  } = useApp();
  const isRegistered = event => {
    return currentUser && event.registeredStudents.includes(currentUser.name);
  };
  const isFull = event => {
    return event.registeredCount >= event.maxParticipants;
  };
  const isPastEvent = event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  };
  const handleRegister = async event => {
    if (isFull(event)) {
      toast.error('This event is already full');
      return;
    }
    if (isPastEvent(event)) {
      toast.error('Cannot register for past events');
      return;
    }
    await registerForEvent(event.id);
    toast.success(`Successfully registered for "${event.title}"`);
  };
  const handleUnregister = async event => {
    if (isPastEvent(event)) {
      toast.error('Cannot unregister from past events');
      return;
    }
    await unregisterFromEvent(event.id);
    toast.success(`Unregistered from "${event.title}"`);
  };
  const filteredEvents = events.filter(event => {
    if (filter === 'upcoming') {
      return !isPastEvent(event);
    }
    if (filter === 'registered') {
      return isRegistered(event);
    }
    return true;
  });
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
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Events</h3>
          <p className="text-gray-600 mb-4">Browse and register for upcoming events</p>

          <div className="flex flex-wrap gap-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')} size="sm" className={filter === 'all' ? 'bg-[#4361ee] hover:bg-[#3451d4]' : ''}>
              All Events ({events.length})
            </Button>
            <Button variant={filter === 'upcoming' ? 'default' : 'outline'} onClick={() => setFilter('upcoming')} size="sm" className={filter === 'upcoming' ? 'bg-[#4361ee] hover:bg-[#3451d4]' : ''}>
              Upcoming ({events.filter(e => !isPastEvent(e)).length})
            </Button>
            <Button variant={filter === 'registered' ? 'default' : 'outline'} onClick={() => setFilter('registered')} size="sm" className={filter === 'registered' ? 'bg-[#4361ee] hover:bg-[#3451d4]' : ''}>
              My Registrations ({events.filter(e => isRegistered(e)).length})
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredEvents.length === 0 ? <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">
                  {filter === 'registered' ? "You haven't registered for any events yet." : 'No events available at the moment.'}
                </p>
              </CardContent>
            </Card> : filteredEvents.map(event => {
          const registered = isRegistered(event);
          const full = isFull(event);
          const past = isPastEvent(event);
          return <Card key={event.id} className={`hover:shadow-md transition-shadow ${past ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          {event.category && <Badge className={getCategoryColor(event.category)}>
                              {event.category}
                            </Badge>}
                          {registered && <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Registered
                            </Badge>}
                          {full && !registered && <Badge className="bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Full
                            </Badge>}
                          {past && <Badge variant="secondary">Past Event</Badge>}
                        </div>
                        <CardDescription>{event.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
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
                        <span className={full ? 'text-red-600 font-semibold' : ''}>
                          {event.registeredCount} / {event.maxParticipants} participants
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {registered ? <Button variant="outline" onClick={() => handleUnregister(event)} disabled={past} className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500">
                        Unregister
                      </Button> : <Button onClick={() => handleRegister(event)} disabled={full || past} className="w-full bg-[#4361ee] hover:bg-[#3451d4]">
                        {full ? 'Event Full' : past ? 'Event Ended' : 'Register Now'}
                      </Button>}
                  </CardFooter>
                </Card>;
        })}
        </div>
      </div>
    </div>;
}
