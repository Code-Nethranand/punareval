import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Clock,
  Settings,
} from "lucide-react";
import { cn } from "../../lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", to: "/dashboard" },
  { icon: FileText, label: "Apply for Revaluation", to: "/dashboard/apply" },
  { icon: FileText, label: "Get Result", to: "/dashboard/result" },
  { icon: Clock, label: "Track Status", to: "/dashboard/status" },
  { icon: CreditCard, label: "Payment History", to: "/dashboard/payments" },
  { icon: Settings, label: "Settings", to: "/dashboard/settings" },
];

export const DashboardSidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r bg-white">
      <nav className="space-y-1 p-4">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium",
                "transition-colors hover:bg-gray-100 hover:text-gray-900",
                isActive ? "bg-gray-100 text-gray-900" : "text-gray-600"
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
