import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { Trophy, Award, Clock, AlertCircle } from 'lucide-react';
export function Overview() {
  const {
    stats,
    achievements,
    events,
    currentUser
  } = useApp();
  const recentAchievements = achievements.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 5);
  const getStatusColor = status => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  const getStatusLabel = status => {
    switch (status) {
      case 'approved':
        return 'Accepted';
      case 'pending':
        return 'Waiting for Admin Review';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).filter(e => currentUser && e.registeredStudents.includes(currentUser.name)).slice(0, 3);
  return <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center hover:shadow-lg hover:scale-105 transition-all border border-blue-200">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-[#4361ee]" />
            <div className="text-4xl font-bold mb-2 text-[#4361ee]">
              {stats.totalAchievements || 0}
            </div>
            <div className="text-sm font-medium text-gray-700">
              Total Achievements
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center hover:shadow-lg hover:scale-105 transition-all border border-green-200">
            <Award className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-4xl font-bold mb-2 text-green-600">
              {stats.approvedAchievements || 0}
            </div>
            <div className="text-sm font-medium text-gray-700">
              Approved
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 text-center hover:shadow-lg hover:scale-105 transition-all border border-yellow-200">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-4xl font-bold mb-2 text-yellow-600">
              {stats.pendingAchievements || 0}
            </div>
            <div className="text-sm font-medium text-gray-700">
              Pending
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center hover:shadow-lg hover:scale-105 transition-all border border-purple-200">
            <div className="text-4xl font-bold mb-2 text-purple-600">
              {stats.totalPoints || 0}
            </div>
            <div className="text-sm font-medium text-gray-700">
              Total Points
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h4 className="text-xl font-bold text-gray-900 mb-4">Recent Achievements</h4>

        {recentAchievements.length === 0 ? <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No achievements yet. Submit your first achievement to get started!</p>
          </div> : <div className="space-y-3">
            {recentAchievements.map(achievement => <div key={achievement.id} className="border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:shadow-md hover:border-blue-300 transition-all bg-white">
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-1">{achievement.title}</h5>
                  <p className="text-sm text-gray-600">
                    Submitted on: {new Date(achievement.submittedAt).toLocaleDateString()} | Category: {achievement.category}
                  </p>
                  {achievement.status === 'rejected' && achievement.rejectionReason && <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {achievement.rejectionReason}
                    </p>}
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold w-fit ${getStatusColor(achievement.status)}`}>
                  {getStatusLabel(achievement.status)}
                </span>
              </div>)}
          </div>}
      </div>

      {upcomingEvents.length > 0 && <div className="bg-white rounded-lg p-6 shadow-sm">
          <h4 className="text-xl font-bold text-gray-900 mb-4">Upcoming Registered Events</h4>
          <div className="space-y-3">
            {upcomingEvents.map(event => <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all">
                <h5 className="font-semibold text-gray-900 mb-1">{event.title}</h5>
                <p className="text-sm text-gray-600">
                  {new Date(event.date).toLocaleDateString()} at {event.time} | {event.location}
                </p>
              </div>)}
          </div>
        </div>}
    </div>;
}

