import { BarChart3, TrendingUp, Award, Users } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
export function Reports() {
  const {
    stats,
    achievements,
    users,
    events
  } = useApp();
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    acc[achievement.category] = (acc[achievement.category] || 0) + 1;
    return acc;
  }, {});
  const achievementsByStatus = {
    approved: achievements.filter(a => a.status === 'approved').length,
    pending: achievements.filter(a => a.status === 'pending').length,
    rejected: achievements.filter(a => a.status === 'rejected').length
  };
  const eventsByCategory = events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {});
  const topStudents = users.map(student => {
    const studentAchievements = achievements.filter(a => a.studentId === student.id && a.status === 'approved');
    const totalPoints = studentAchievements.reduce((sum, a) => sum + (a.points || 0), 0);
    return {
      name: student.name,
      achievements: studentAchievements.length,
      points: totalPoints
    };
  }).filter(s => s.achievements > 0).sort((a, b) => b.points - a.points).slice(0, 10);
  return <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-[#4361ee]" />
          Reports & Analytics
        </h3>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Students</CardDescription>
              <CardTitle className="text-3xl text-[#4361ee]">{stats.totalStudents || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Active users in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Achievements</CardDescription>
              <CardTitle className="text-3xl text-purple-600">{stats.totalAchievements || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">All submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approval Rate</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {stats.totalAchievements > 0 ? Math.round(stats.approvedAchievements / stats.totalAchievements * 100) : 0}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {stats.approvedAchievements} of {stats.totalAchievements} approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Events</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{stats.totalEvents || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {stats.upcomingEvents} upcoming
              </p>
            </CardContent>
          </Card>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Status Distribution</CardTitle>
              <CardDescription>Breakdown by approval status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Approved</span>
                    <span className="text-sm text-gray-600">{achievementsByStatus.approved}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{
                    width: `${stats.totalAchievements > 0 ? achievementsByStatus.approved / stats.totalAchievements * 100 : 0}%`
                  }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Pending</span>
                    <span className="text-sm text-gray-600">{achievementsByStatus.pending}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{
                    width: `${stats.totalAchievements > 0 ? achievementsByStatus.pending / stats.totalAchievements * 100 : 0}%`
                  }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Rejected</span>
                    <span className="text-sm text-gray-600">{achievementsByStatus.rejected}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{
                    width: `${stats.totalAchievements > 0 ? achievementsByStatus.rejected / stats.totalAchievements * 100 : 0}%`
                  }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements by Category</CardTitle>
              <CardDescription>Distribution across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(achievementsByCategory).length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No achievements yet</p> : Object.entries(achievementsByCategory).sort(([, a], [, b]) => b - a).map(([category, count]) => <div key={category} className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm font-medium">{category}</span>
                        <span className="text-sm text-gray-600">{count}</span>
                      </div>)}
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Top Performing Students
            </CardTitle>
            <CardDescription>Students ranked by approved achievements and points</CardDescription>
          </CardHeader>
          <CardContent>
            {topStudents.length === 0 ? <p className="text-center py-8 text-gray-500">No student achievements yet</p> : <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Rank</th>
                      <th className="text-left py-3 px-4">Student Name</th>
                      <th className="text-right py-3 px-4">Achievements</th>
                      <th className="text-right py-3 px-4">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStudents.map((student, index) => <tr key={student.name} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold ${index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-gray-100 text-gray-800' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-50 text-blue-800'}`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">{student.name}</td>
                        <td className="py-3 px-4 text-right">{student.achievements}</td>
                        <td className="py-3 px-4 text-right font-semibold text-purple-600">
                          {student.points}
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>}
          </CardContent>
        </Card>

        {}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Event Statistics</CardTitle>
            <CardDescription>Overview of event management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{events.length}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.upcomingEvents || 0}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.totalEventRegistrations || 0}</div>
                <div className="text-sm text-gray-600">Total Registrations</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {events.length > 0 ? Math.round(stats.totalEventRegistrations / events.length) : 0}
                </div>
                <div className="text-sm text-gray-600">Avg per Event</div>
              </div>
            </div>

            {Object.keys(eventsByCategory).length > 0 && <div className="mt-6">
                <h5 className="font-semibold text-gray-900 mb-3">Events by Category</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(eventsByCategory).map(([category, count]) => <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>)}
                </div>
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>;
}
