import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { DemoSwitcher } from '../common/DemoSwitcher';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Search, Shield, BookOpen, Clock, Users } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isStudent = user?.role === 'student';
  const isFaculty = user?.role === 'faculty';
  const isPlacement = user?.role === 'placement_officer';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Demo Switcher Bar */}
      <DemoSwitcher />

      {/* Main Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Role-Specific Sub-Navbar for Faculty, Placement, Admin */}
      {!isStudent && user && (
        <div className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-2.5 shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-navy-900 flex items-center gap-1.5">
                {isFaculty && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                {isPlacement && <Search className="w-4 h-4 text-brand-600" />}
                {isAdmin && <Shield className="w-4 h-4 text-rose-600" />}
                {isFaculty ? 'Faculty Verification Center' : isPlacement ? 'Corporate & Placement Officer Portal' : 'Administrator Control Panel'}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">{user.department || 'University Portal'}</span>
            </div>

            <div className="flex items-center gap-2">
              {isFaculty && (
                <>
                  <Link
                    to="/faculty/dashboard"
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      location.pathname === '/faculty/dashboard'
                        ? 'bg-purple-50 text-purple-700 font-semibold'
                        : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                    }`}
                  >
                    Verification Queue
                  </Link>
                  <Link
                    to="/faculty/history"
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      location.pathname === '/faculty/history'
                        ? 'bg-purple-50 text-purple-700 font-semibold'
                        : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                    }`}
                  >
                    Verification History
                  </Link>
                </>
              )}

              {isPlacement && (
                <>
                  <Link
                    to="/placement/dashboard"
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      location.pathname === '/placement/dashboard'
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                    }`}
                  >
                    Talent Discovery
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      location.pathname === '/admin/dashboard'
                        ? 'bg-rose-50 text-rose-700 font-semibold'
                        : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                    }`}
                  >
                    Platform Overview
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {isStudent && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
