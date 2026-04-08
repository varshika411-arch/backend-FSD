import { useState } from 'react';
import { Home, User, Trophy, Plus, Briefcase, Bell, LogOut, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Overview } from './student/Overview';
import { Profile } from './student/Profile';
import { Achievements } from './student/Achievements';
import { SubmitAchievement } from './student/SubmitAchievement';
import { Portfolio } from './student/Portfolio';
import { Notifications } from './student/Notifications';
import { Events } from './student/Events';
export function StudentDashboard({
  userName,
  onLogout
}) {
  return <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#4361ee]">Student Dashboard</h2>
            <div className="flex items-center gap-3 md:gap-4">
              <span className="hidden sm:inline text-sm md:text-base">Welcome, <strong>{userName}</strong></span>
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
                <TabsTrigger value="profile" className="justify-start gap-3 w-full px-4 py-3 data-[state=active]:bg-[#4361ee] data-[state=active]:text-white hover:bg-gray-100 data-[state=active]:hover:bg-[#4361ee] transition-colors rounded-lg">
                  <User className="h-5 w-5" />
                  <span className="font-medium">My Profile</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="justify-start gap-3 w-full px-4 py-3 data-[state=active]:bg-[#4361ee] data-[state=active]:text-white hover:bg-gray-100 data-[state=active]:hover:bg-[#4361ee] transition-colors rounded-lg">
                  <Trophy className="h-5 w-5" />
                  <span className="font-medium">My Achievements</span>
                </TabsTrigger>
                <TabsTrigger value="submit" className="justify-start gap-3 w-full px-4 py-3 data-[state=active]:bg-[#4361ee] data-[state=active]:text-white hover:bg-gray-100 data-[state=active]:hover:bg-[#4361ee] transition-colors rounded-lg">
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Submit Achievement</span>
                </TabsTrigger>
                <TabsTrigger value="portfolio" className="justify-start gap-3 w-full px-4 py-3 data-[state=active]:bg-[#4361ee] data-[state=active]:text-white hover:bg-gray-100 data-[state=active]:hover:bg-[#4361ee] transition-colors rounded-lg">
                  <Briefcase className="h-5 w-5" />
                  <span className="font-medium">My Portfolio</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="justify-start gap-3 w-full px-4 py-3 data-[state=active]:bg-[#4361ee] data-[state=active]:text-white hover:bg-gray-100 data-[state=active]:hover:bg-[#4361ee] transition-colors rounded-lg">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Events</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="justify-start gap-3 w-full px-4 py-3 data-[state=active]:bg-[#4361ee] data-[state=active]:text-white hover:bg-gray-100 data-[state=active]:hover:bg-[#4361ee] transition-colors rounded-lg">
                  <Bell className="h-5 w-5" />
                  <span className="font-medium">Notifications</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto bg-[#f5f7fb]">
            <div className="p-4 md:p-6 lg:p-8">
              <TabsContent value="overview" className="mt-0">
                <Overview />
              </TabsContent>
              <TabsContent value="profile" className="mt-0">
                <Profile />
              </TabsContent>
              <TabsContent value="achievements" className="mt-0">
                <Achievements />
              </TabsContent>
              <TabsContent value="submit" className="mt-0">
                <SubmitAchievement />
              </TabsContent>
              <TabsContent value="portfolio" className="mt-0">
                <Portfolio />
              </TabsContent>
              <TabsContent value="events" className="mt-0">
                <Events />
              </TabsContent>
              <TabsContent value="notifications" className="mt-0">
                <Notifications />
              </TabsContent>
            </div>
          </main>
        </Tabs>
      </div>
    </div>;
}
