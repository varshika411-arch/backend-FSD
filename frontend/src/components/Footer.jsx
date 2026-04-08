import { toast } from 'sonner';
export function Footer() {
  const handleLinkClick = (e, linkName) => {
    e.preventDefault();
    toast.info(`Navigating to: ${linkName}`);
  };
  return <footer className="bg-[#212529] text-white py-12 mt-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="mb-4">About AchieveTrack</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" onClick={e => handleLinkClick(e, 'Our Mission')} className="text-[#adb5bd] hover:text-white transition-colors">
                  Our Mission
                </a>
              </li>
              <li>
                <a href="#" onClick={e => handleLinkClick(e, 'Team')} className="text-[#adb5bd] hover:text-white transition-colors">
                  Team
                </a>
              </li>
              <li>
                <a href="#" onClick={e => handleLinkClick(e, 'Careers')} className="text-[#adb5bd] hover:text-white transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" onClick={e => handleLinkClick(e, 'Help Center')} className="text-[#adb5bd] hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" onClick={e => handleLinkClick(e, 'Documentation')} className="text-[#adb5bd] hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" onClick={e => handleLinkClick(e, 'Privacy Policy')} className="text-[#adb5bd] hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" onClick={e => handleLinkClick(e, 'Support')} className="text-[#adb5bd] hover:text-white transition-colors">
                  Support
                </a>
              </li>
              <li>
                <a href="#" onClick={e => handleLinkClick(e, 'Feedback')} className="text-[#adb5bd] hover:text-white transition-colors">
                  Feedback
                </a>
              </li>
              <li>
                <a href="#" onClick={e => handleLinkClick(e, 'Social Media')} className="text-[#adb5bd] hover:text-white transition-colors">
                  Social Media
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#495057] pt-4 text-center text-[#adb5bd]">
          <p>&copy; 2026 AchieveTrack. All rights reserved.</p>
        </div>
      </div>
    </footer>;
}
