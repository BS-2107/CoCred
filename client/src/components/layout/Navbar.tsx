import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Notification } from '../../types';
import {
  Bell,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X,
  Check,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user && user.role === 'student') {
      api.getNotifications()
        .then(res => {
          if (res.success && res.notifications) {
            setNotifications(res.notifications);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'faculty':
        return <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">Faculty Reviewer</span>;
      case 'placement_officer':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">Placement Officer</span>;
      case 'admin':
        return <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-medium">Administrator</span>;
      default:
        return <span className="bg-brand-50 text-brand-700 text-xs px-2 py-0.5 rounded-full font-medium">Student</span>;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-4">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-navy-900 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-brand-700 transition">
              C
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-navy-900 tracking-tight text-lg">CoCred</span>
                <span className="text-[10px] bg-brand-50 text-brand-700 border border-brand-200 px-1.5 py-0.2 rounded font-semibold">2.0</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Academic & Credential Verification</p>
            </div>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user?.role === 'student' && profile && (
            <Link
              to={`/portfolio/${profile.portfolio_slug}`}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/80 hover:bg-brand-100 transition shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Public Portfolio
            </Link>
          )}

          {/* Notifications Dropdown (for Students) */}
          {user?.role === 'student' && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-xs text-navy-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 p-4 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition ${n.is_read ? 'bg-white opacity-75' : 'bg-brand-50/30'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-navy-900">{n.title}</span>
                            {!n.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(n.id)}
                                title="Mark as read"
                                className="text-brand-600 hover:text-brand-800"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              >
                <img
                  src={user.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                />
                <div className="text-left hidden md:block leading-tight">
                  <div className="font-semibold text-xs text-navy-900 truncate max-w-[130px]">
                    {user.full_name}
                  </div>
                  <div className="mt-0.5">{getRoleBadge(user.role)}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-navy-900">{user.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1.5">{getRoleBadge(user.role)}</div>
                  </div>

                  <div className="py-1">
                    {user.role === 'student' && (
                      <>
                        <Link
                          to="/student/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          My Profile & CGPA
                        </Link>
                        <Link
                          to="/student/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          Portfolio & Privacy Settings
                        </Link>
                      </>
                    )}

                    {user.role === 'faculty' && (
                      <Link
                        to="/faculty/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        Verification Queue
                      </Link>
                    )}

                    {user.role === 'placement_officer' && (
                      <Link
                        to="/placement/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        Recruiter Dashboard
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        Admin Control Center
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-navy-900 transition"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition shadow-xs"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
