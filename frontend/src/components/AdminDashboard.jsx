import { Home, Users, CheckCircle, BarChart3, LogOut, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AdminOverview } from './admin/AdminOverview';
import { ManageStudents } from './admin/ManageStudents';
import { VerifyAchievements } from './admin/VerifyAchievements';
import { Reports } from './admin/Reports';
import { ManageEvents } from './admin/ManageEvents';
export function AdminDashboard({
  userName,
  onLogout
}) {
  return <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#4361ee]">Admin Dashboard</h2>
            <div className="flex items-center gap-3 md:gap-4">
              <span className="hidden sm:inline text-sm md:text-base">Welcome, <strong>{userName || 'Admin'}</strong></span>
              <Button variant="outline" onClick={onLogout} className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Tabs defaultValue="overview" className="flex-1 flex flex-col md:flex-row" orientation="vertical">
          <aside className="w-full md:w-64 lg:w-72 bg-white border-r border-gray-200 md:flex-shrink-0">
            <div className="h-full overflow-y-auto">
              <TabsList className="flex flex-col h-auto bg-white p-4 md:p-6 space-y-2">
                <TabsTrigger value="overview" className="justify-start gap-3 w-full px-4 py-3 data-[state=active]:bg-[#4361ee] data-[state=active]:text-white hover:bg-gray-100 data-[state=active]:hover:bg-[#4361ee] transition-colors rounded-lg">
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="students" className="justify-start gap-3 w-full px-4 py-3 data-[state=active]:bg-[#4361ee] data-[state=active]:text-white hover:bg-gray-100 data-[state=active]:hover:bg-[#4361ee] transition-colors rounded-lg">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Manage Students</span>
                </TabsTrigger>
                <TabsTrigger value="verify" className="justify-start gap-3 w-full px-4 py-3 data-[state=active]:bg-[#4361ee] data-[state=active]:text-white hover:bg-gray-100 data-[state=active]:hover:bg-[#4361ee] transition-colors rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Verify Achievements</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="justify-start gap-3 w-full px-4 py-3 data-[state=active]:bg-[#4361ee] data-[state=active]:text-white hover:bg-gray-100 data-[state=active]:hover:bg-[#4361ee] transition-colors rounded-lg">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Manage Events</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="justify-start gap-3 w-full px-4 py-3 data-[state=active]:bg-[#4361ee] data-[state=active]:text-white hover:bg-gray-100 data-[state=active]:hover:bg-[#4361ee] transition-colors rounded-lg">
                  <BarChart3 className="h-5 w-5" />
                  <span className="font-medium">Reports</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto bg-[#f5f7fb]">
            <div className="p-4 md:p-6 lg:p-8">
              <TabsContent value="overview" className="mt-0">
                <AdminOverview />
              </TabsContent>
              <TabsContent value="students" className="mt-0">
                <ManageStudents />
              </TabsContent>
              <TabsContent value="verify" className="mt-0">
                <VerifyAchievements />
              </TabsContent>
              <TabsContent value="events" className="mt-0">
                <ManageEvents />
              </TabsContent>
              <TabsContent value="reports" className="mt-0">
                <Reports />
              </TabsContent>
            </div>
          </main>
        </Tabs>
      </div>
    </div>;
}
