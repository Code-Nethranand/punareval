import React from "react";
import { Link, useLocation } from "react-router-dom";
import { GraduationCap, User } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../ui/Button";

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold">VTU Revaluation</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {!isAuthenticated && !isAdminPage && (
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          )}
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{user?.usn}</span>
              </div>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
