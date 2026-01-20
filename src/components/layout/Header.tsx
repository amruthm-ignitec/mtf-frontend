import { Link, useNavigate } from 'react-router-dom';
import { User, LayoutDashboard, Settings, HelpCircle, LogOut, ChevronDown, Bell, Users, MessageSquare } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../notifications/NotificationDropdown';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'doc_uploader':
        return 'Document Uploader';
      case 'medical_director':
        return 'Medical Director';
      default:
        return role;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 pl-4 sm:pl-6 lg:pl-8">
            <Link to="/" className="flex items-center">
              <img
                src="/donorIQ-_logo.svg"
                alt="DonorIQ"
                className="h-20 w-auto -ml-[10px]"
              />
            </Link>
          </div>
          <div className="flex-1 flex justify-between items-center px-4 sm:px-6 lg:px-8">
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {/* Dashboard is an admin-only page, so only show it for admins */}
              {user?.role === 'admin' && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              )}
              {/* Donor list is visible to all authenticated roles; admin-only actions are restricted inside the page */}
              <Link
                to="/donors"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Donors
              </Link>
              <Link
                to="/feedback"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Platform Feedback
              </Link>
            </nav>
            <div className="flex items-center">
              <div className="relative mr-4" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 text-gray-400 hover:text-gray-500 relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 z-50">
                    <NotificationDropdown />
                  </div>
                )}
              </div>
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50"
                >
                  <User className="w-4 h-4 mr-2" />
                  {user?.full_name || 'User'}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                      <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role || '')}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    {/* App-level settings are available to all roles */}
                    <Link
                      to="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                    {/* Admin-only user/platform administration */}
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Admin
                      </Link>
                    )}
                    <Link
                      to="/support"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Support
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
