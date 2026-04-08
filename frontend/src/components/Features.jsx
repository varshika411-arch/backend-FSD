import { GraduationCap, ShieldCheck, Briefcase, Bell } from 'lucide-react';
export function Features() {
  return <section id="features" className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{
          color: '#4361ee'
        }}>
            Platform Features
          </h2>
          <p className="text-lg max-w-3xl mx-auto" style={{
          color: '#6c757d'
        }}>
            Discover how AchieveTrack helps students organize their achievements and build
            impressive profiles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-lg p-8 shadow-md hover:-translate-y-1 transition-transform">
            <div className="mb-4" style={{
            color: '#4361ee'
          }}>
              <GraduationCap className="h-10 w-10" />
            </div>
            <h3 className="mb-4">Student Module</h3>
            <p style={{
            color: '#6c757d'
          }}>
              Register, manage your profile, and submit achievements with ease. Track your progress
              and build your portfolio.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md hover:-translate-y-1 transition-transform">
            <div className="mb-4" style={{
            color: '#4361ee'
          }}>
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h3 className="mb-4">Admin Module</h3>
            <p style={{
            color: '#6c757d'
          }}>
              Verify achievements, provide feedback, and generate detailed reports on student
              participation and accomplishments.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md hover:-translate-y-1 transition-transform">
            <div className="mb-4" style={{
            color: '#4361ee'
          }}>
              <Briefcase className="h-10 w-10" />
            </div>
            <h3 className="mb-4">Digital Portfolio</h3>
            <p style={{
            color: '#6c757d'
          }}>
              Create a stunning portfolio showcasing your achievements with multimedia support.
              Share with colleges and employers.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md hover:-translate-y-1 transition-transform">
            <div className="mb-4" style={{
            color: '#4361ee'
          }}>
              <Bell className="h-10 w-10" />
            </div>
            <h3 className="mb-4">Notifications</h3>
            <p style={{
            color: '#6c757d'
          }}>
              Stay updated with alerts for new achievements, approvals, feedback, and custom
              reminders for deadlines.
            </p>
          </div>
        </div>
      </div>
    </section>;
}
