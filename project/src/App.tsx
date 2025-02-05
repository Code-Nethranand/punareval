import React, { useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Header } from "./components/layout/Header";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SubjectSelectionPage } from "./pages/SubjectSelectionPage";
import { PaymentPage } from "./pages/PaymentPage";
import { StatusPage } from "./pages/StatusPage";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { useAuthStore } from "./store/useAuthStore";
import { ResultPage } from "./pages/Result";
import { PaymentHistoryPage } from "./pages/PaymentHistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { Toaster } from "react-hot-toast";
import { SignupPage } from "./pages/SignupPage";
import { PaymentStatusPage } from './pages/PaymentStatusPage';
import { initializeAuth } from "./store/useAuthStore";
import { AdminLoginPage } from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const newsItems = [
  {
    id: 1,
    title: "2021 Scheme 7th Semester Results Announced",
    date: "2024-02-15",
    type: "result",
    link: "#"
  },
  {
    id: 2,
    title: "2022 Scheme 4th Semester Results Declaration Soon",
    date: "2024-02-14",
    type: "announcement"
  },
  {
    id: 3,
    title: "Revaluation Window Open for 2021 Scheme 6th Semester",
    date: "2024-02-12",
    type: "revaluation"
  },
  {
    id: 4,
    title: "Important Notice: Last Date for 8th Semester Registration Extended",
    date: "2024-02-10",
    type: "notice"
  }
];

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <div className="py-12">
                  {/* Existing welcome section */}
                  <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      VTU Online Revaluation System
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                      Welcome to the VTU Online Revaluation System. Apply for
                      revaluation, track your application status, and view results -
                      all in one place.
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => window.location.href = '/login'}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                      >
                        Login as Student
                      </button>
                      <button
                        onClick={() => window.location.href = '/admin/login'}
                        className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                      >
                        Login as Admin
                      </button>
                    </div>
                  </div>

                  {/* Modified News Carousel Section */}
                  <div className="max-w-7xl mx-auto px-4 mb-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 px-4">Latest Updates</h2>
                    <div className="relative overflow-hidden">
                      <div className="flex animate-scroll">
                        {/* First set of items */}
                        {newsItems.map((item) => (
                          <div
                            key={`original-${item.id}`}
                            className="flex-shrink-0 w-[320px] mx-[30px] bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-300"
                          >
                            <div className="p-6 space-y-4">
                              <div className={`
                                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                ${item.type === 'result' ? 'bg-green-100 text-green-800' : ''}
                                ${item.type === 'announcement' ? 'bg-blue-100 text-blue-800' : ''}
                                ${item.type === 'revaluation' ? 'bg-purple-100 text-purple-800' : ''}
                                ${item.type === 'notice' ? 'bg-yellow-100 text-yellow-800' : ''}
                              `}>
                                {item.type === 'result' && '🎓'}
                                {item.type === 'announcement' && '📢'}
                                {item.type === 'revaluation' && '📝'}
                                {item.type === 'notice' && '⚠️'}
                                <span className="ml-2 capitalize">{item.type}</span>
                              </div>
                              
                              <h3 className="font-semibold text-gray-900 line-clamp-2">
                                {item.title}
                              </h3>
                              
                              <p className="text-sm text-gray-500">
                                {new Date(item.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>

                              {item.link && (
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center">
                                  View Details
                                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {/* Duplicate set for seamless loop */}
                        {newsItems.map((item) => (
                          <div
                            key={`duplicate-${item.id}`}
                            className="flex-shrink-0 w-[320px] mx-[30px] bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-300"
                          >
                            <div className="p-6 space-y-4">
                              <div className={`
                                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                ${item.type === 'result' ? 'bg-green-100 text-green-800' : ''}
                                ${item.type === 'announcement' ? 'bg-blue-100 text-blue-800' : ''}
                                ${item.type === 'revaluation' ? 'bg-purple-100 text-purple-800' : ''}
                                ${item.type === 'notice' ? 'bg-yellow-100 text-yellow-800' : ''}
                              `}>
                                {item.type === 'result' && '🎓'}
                                {item.type === 'announcement' && '📢'}
                                {item.type === 'revaluation' && '📝'}
                                {item.type === 'notice' && '⚠️'}
                                <span className="ml-2 capitalize">{item.type}</span>
                              </div>
                              
                              <h3 className="font-semibold text-gray-900 line-clamp-2">
                                {item.title}
                              </h3>
                              
                              <p className="text-sm text-gray-500">
                                {new Date(item.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>

                              {item.link && (
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center">
                                  View Details
                                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          />
          
          {/* ...rest of the routes... */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage />
              )
            } 
          />
          <Route 
            path="/signup" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <SignupPage />
              )
            } 
          />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/apply"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SubjectSelectionPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/payment"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PaymentPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/status"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <StatusPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/result"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ResultPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/payments"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PaymentHistoryPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/status"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PaymentStatusPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
