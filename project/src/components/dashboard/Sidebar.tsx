import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileEdit, 
  FileCheck, 
  Clock, 
  CreditCard, 
  Settings 
} from 'lucide-react';

const navItems = [
  { 
    path: '/dashboard', 
    label: 'Overview', 
    icon: LayoutDashboard 
  },
  { 
    path: '/dashboard/apply', 
    label: 'Apply for Revaluation', 
    icon: FileEdit 
  },
  { 
    path: '/dashboard/result', 
    label: 'Get Result', 
    icon: FileCheck 
  },
  { 
    path: '/dashboard/status', 
    label: 'Track Status', 
    icon: Clock 
  },
  { 
    path: '/dashboard/payments', 
    label: 'Payment History', 
    icon: CreditCard 
  },
  { 
    path: '/dashboard/settings', 
    label: 'Settings', 
    icon: Settings 
  },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-md">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
              end={item.path === '/dashboard'}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
