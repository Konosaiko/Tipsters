import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-neutral-900 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-neutral-950 font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-white">Tipsters</span>
            </Link>

            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`
                }
              >
                Feed
              </NavLink>
              <NavLink
                to="/tipsters"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`
                }
              >
                Tipsters
              </NavLink>
              {isAuthenticated && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-500/10 text-primary-500'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`
                  }
                >
                  Dashboard
                </NavLink>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-neutral-400">
                  Hi, <span className="text-white font-medium">{user?.username}</span>
                </span>
                <button
                  onClick={logout}
                  className="text-neutral-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-neutral-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 hover:bg-primary-400 text-neutral-950 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
