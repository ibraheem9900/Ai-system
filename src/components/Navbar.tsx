import { Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const APP_LOGO = '/1775218881775-3ee13392-9669-4d24-ae5f-9ac05cae51cf.png';

interface NavbarProps {
  userName: string;
  onSettingsClick: () => void;
  onMenuToggle: () => void;
}

export default function Navbar({ userName, onSettingsClick, onMenuToggle }: NavbarProps) {
  const { signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-800/50 glass flex-shrink-0">
      <div className="px-3 sm:px-5">
        <div className="flex items-center justify-between h-14">

          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800/70 transition-all duration-200 text-gray-400 hover:text-white active:scale-90"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-lg flex items-center justify-center overflow-hidden border border-blue-500/20">
                <img src={APP_LOGO} alt="ITA AI" className="w-5 h-5" />
              </div>
              <span className="font-black text-base tracking-wide gradient-text-animated">ITA AI</span>
            </div>
          </div>

          {/* Right: username + actions */}
          <div className="flex items-center gap-1">
            {userName && (
              <span className="hidden sm:inline text-sm text-gray-400 font-medium mr-2 max-w-[120px] truncate">
                {userName}
              </span>
            )}
            <button
              onClick={onSettingsClick}
              title="Settings"
              className="p-2 rounded-lg hover:bg-gray-800/70 transition-all duration-200 text-gray-500 hover:text-blue-400 active:scale-90"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={signOut}
              title="Sign out"
              className="p-2 rounded-lg hover:bg-gray-800/70 transition-all duration-200 text-gray-500 hover:text-red-400 active:scale-90"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
