import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  userName: string;
  onSettingsClick: () => void;
}

export default function Navbar({ userName, onSettingsClick }: NavbarProps) {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-800 bg-gradient-to-r from-gray-950 to-blue-950 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img
              src="/1775218881775-3ee13392-9669-4d24-ae5f-9ac05cae51cf.png"
              alt="Logo"
              className="w-8 h-8"
            />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              SearchAI
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {userName && (
              <span className="hidden sm:inline text-sm text-gray-300 font-medium">
                {userName}
              </span>
            )}
            <button
              onClick={onSettingsClick}
              className="p-2.5 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-400 hover:text-blue-400 transition-colors" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              title="Sign out"
            >
              <LogOut className="w-5 h-5 text-gray-400 hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
