import { Trophy } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
export function Header({
  onLoginClick,
  onRegisterClick
}) {
  const handleNavClick = (e, section) => {
    if (section === 'Home') {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      toast.info('Scrolling to top');
    } else if (section === 'Features') {} else {
      e.preventDefault();
      toast.info(`Navigating to: ${section}`);
    }
  };
  return <header className="sticky top-0 z-50 shadow-md" style={{
    background: 'linear-gradient(135deg, #4361ee, #3f37c9)'
  }}>
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <Trophy className="h-7 w-7" />
            <span className="text-2xl font-bold">AchieveTrack</span>
          </div>
          
          <nav>
            <ul className="flex flex-wrap justify-center gap-5">
              <li>
                <a href="#" onClick={e => handleNavClick(e, 'Home')} className="text-white px-3 py-1 rounded transition-colors hover:bg-white/20">
                  Home
                </a>
              </li>
              <li>
                <a href="#features" onClick={e => handleNavClick(e, 'Features')} className="text-white px-3 py-1 rounded transition-colors hover:bg-white/20">
                  Features
                </a>
              </li>
              <li>
                <a href="#about" onClick={e => handleNavClick(e, 'About')} className="text-white px-3 py-1 rounded transition-colors hover:bg-white/20">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" onClick={e => handleNavClick(e, 'Contact')} className="text-white px-3 py-1 rounded transition-colors hover:bg-white/20">
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onLoginClick} className="border-white text-white bg-transparent hover:bg-white hover:text-[#4361ee]">
              Login
            </Button>
            <Button onClick={onRegisterClick} className="bg-[#4cc9f0] text-white hover:bg-[#3aa8d4] hover:-translate-y-0.5 transition-all">
              Register
            </Button>
          </div>
        </div>
      </div>
    </header>;
}
