import { Users, Trophy, Clock, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
export function AdminOverview() {
  const {
    stats,
    achievements,
    events
  } = useApp();
  const recentAchievements = achievements.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 5);
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
  return <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard Overview</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center hover:shadow-lg hover:scale-105 transition-all border border-blue-200">
            <Users className="h-8 w-8 mx-auto mb-2 text-[#4361ee]" />
            <div className="text-4xl font-bold mb-2 text-[#4361ee]">
              {stats.totalStudents || 0}
            </div>
            <div className="text-sm font-medium text-gray-700">
              Total Students
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center hover:shadow-lg hover:scale-105 transition-all border border-purple-200">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-4xl font-bold mb-2 text-purple-600">
              {stats.totalAchievements || 0}
            </div>
            <div className="text-sm font-medium text-gray-700">
              Total Achievements
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 text-center hover:shadow-lg hover:scale-105 transition-all border border-yellow-200">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-4xl font-bold mb-2 text-yellow-600">
              {stats.pendingAchievements || 0}
            </div>
            <div className="text-sm font-medium text-gray-700">
              Pending Review
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center hover:shadow-lg hover:scale-105 transition-all border border-green-200">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-4xl font-bold mb-2 text-green-600">
              {stats.approvedAchievements || 0}
            </div>
            <div className="text-sm font-medium text-gray-700">
              Approved
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Recent Achievement Submissions
          </h4>

          {recentAchievements.length === 0 ? <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No achievements submitted yet</p>
            </div> : <div className="space-y-3">
              {recentAchievements.map(achievement => <div key={achievement.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1">{achievement.title}</h5>
                      <p className="text-sm text-gray-600">
                        by {achievement.studentName} • {achievement.category}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${achievement.status === 'approved' ? 'bg-green-100 text-green-700' : achievement.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {achievement.status.charAt(0).toUpperCase() + achievement.status.slice(1)}
                    </span>
                  </div>
                </div>)}
            </div>}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Upcoming Events
          </h4>

          {upcomingEvents.length === 0 ? <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No upcoming events</p>
            </div> : <div className="space-y-3">
              {upcomingEvents.map(event => <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all">
                  <h5 className="font-semibold text-gray-900 mb-1">{event.title}</h5>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    <span className={event.registeredCount >= event.maxParticipants ? 'text-red-600 font-semibold' : ''}>
                      {event.registeredCount}/{event.maxParticipants} registered
                    </span>
                  </div>
                </div>)}
            </div>}
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Quick Stats
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.totalEvents || 0}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.upcomingEvents || 0}</div>
            <div className="text-sm text-gray-600">Upcoming Events</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.totalEventRegistrations || 0}</div>
            <div className="text-sm text-gray-600">Event Registrations</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.rejectedAchievements || 0}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      </div>
    </div>;
}
