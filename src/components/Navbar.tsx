import { Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  userName: string;
  onSettingsClick: () => void;
  onMenuToggle: () => void;
}

export default function Navbar({ userName, onSettingsClick, onMenuToggle }: NavbarProps) {
  const { signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-800/60 glass">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-all duration-200 text-gray-400 hover:text-white active:scale-90"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <img
                src="/1775218881775-3ee13392-9669-4d24-ae5f-9ac05cae51cf.png"
                alt="Logo"
                className="w-7 h-7"
              />
              <h1 className="text-lg font-bold gradient-text-animated">Ita AI</h1>
            </div>
          </div>

          {/* Right: username + actions */}
          <div className="flex items-center gap-1.5">
            {userName && (
              <span className="hidden sm:inline text-sm text-gray-400 font-medium mr-2">
                {userName}
              </span>
            )}
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-lg hover:bg-gray-800 transition-all duration-200 text-gray-400 hover:text-blue-400 active:scale-90"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={signOut}
              className="p-2 rounded-lg hover:bg-gray-800 transition-all duration-200 text-gray-400 hover:text-red-400 active:scale-90"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
