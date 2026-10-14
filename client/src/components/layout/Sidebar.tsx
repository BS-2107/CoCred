import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  GraduationCap,
  CalendarCheck,
  Award,
  Trophy,
  Briefcase,
  Globe,
  Settings,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuth();

  const navItems = [
    { name: 'Overview', to: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', to: '/student/profile', icon: UserCheck },
    { name: 'Academic Records', to: '/student/academic-records', icon: GraduationCap },
    { name: 'Attendance', to: '/student/attendance', icon: CalendarCheck },
    { name: 'Certificates', to: '/student/certificates', icon: Award },
    { name: 'Achievements', to: '/student/achievements', icon: Trophy },
    { name: 'Projects & Internships', to: '/student/projects', icon: Briefcase },
    { name: 'My Portfolio', to: '/student/settings', icon: Globe },
    { name: 'Settings & Privacy', to: '/student/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-20 md:hidden backdrop-blur-2xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Student Portal
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to + item.name}
                to={item.to}
                onClick={onClose}
                end={item.to === '/student/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-2xs border border-brand-100/60'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Portfolio Card */}
        {profile && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-navy-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                  Public Portfolio
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                  profile.is_public ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {profile.is_public ? 'Live' : 'Private'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                /portfolio/{profile.portfolio_slug}
              </p>
              <a
                href={`/portfolio/${profile.portfolio_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-1.5 px-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Live Link
              </a>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
