import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// SVG Icons as components for better maintainability
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Bets: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  Premium: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Create: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 4v16m8-8H4" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Home: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
};

// Navigation items configuration
const navItems = [
  {
    path: '/dashboard',
    label: 'Statistics',
    icon: Icons.Dashboard,
    end: true // Only match exact path
  },
  {
    path: '/dashboard/bets',
    label: 'My Bets',
    icon: Icons.Bets
  },
  {
    path: '/dashboard/premium',
    label: 'Premium',
    icon: Icons.Premium
  },
  {
    path: '/dashboard/create',
    label: 'Create a Bet',
    icon: Icons.Create
  },
  {
    path: '/dashboard/settings',
    label: 'Settings',
    icon: Icons.Settings
  },
];

export const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const { user } = useAuth();

  const handleNavClick = () => {
    // Close sidebar on mobile when a link is clicked
    onClose?.();
  };

  return (
    <aside className={`
      fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col z-40
      transition-transform duration-300 ease-in-out
      lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Mobile close button */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-neutral-800">
        <span className="text-white font-semibold">Dashboard Menu</span>
        <button
          onClick={onClose}
          className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
          Main Menu
        </p>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-500/10 text-primary-500'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`
            }
          >
            <item.icon />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}

        {/* Separator */}
        <div className="my-4 border-t border-neutral-800" />

        <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
          Quick Links
        </p>

        {/* Back to public site */}
        <NavLink
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all duration-200"
        >
          <Icons.Home />
          <span className="font-medium">Back to Feed</span>
        </NavLink>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {user?.username || 'User'}
            </p>
            <p className="text-neutral-500 text-xs truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
