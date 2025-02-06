import React, { useEffect, useRef, useState } from "react";
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
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';

interface Announcement {
  _id: string;
  title: string;
  date: string;
  type: 'Announcement' | 'Result' | 'Revaluation' | 'Notice';
  link?: string;
  createdAt: string;
  updatedAt: string;
}

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [newsItems, setNewsItems] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/announcements');
        const data = await response.json();
        setNewsItems(data);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

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

                  {/* Enhanced News section with animation */}
                  <div className="max-w-5xl mx-auto mt-12 bg-white rounded-lg shadow-lg p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold text-gray-900">Latest News & Updates</h2>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Live Updates
                        </span>
                      </div>
                    </div>
                    <div className="relative w-full overflow-hidden">
                      <div className="animate-news-scroll flex space-x-6 hover:[animation-play-state:paused]">
                        {/* First set of items */}
                        {newsItems.map((item) => (
                          <div
                            key={item._id}
                            className="inline-flex flex-col min-w-[350px] max-w-[350px] flex-none p-5 bg-gray-50 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-gray-100"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                item.type === 'Result' ? 'bg-green-100 text-green-800' :
                                item.type === 'Announcement' ? 'bg-blue-100 text-blue-800' :
                                item.type === 'Revaluation' ? 'bg-purple-100 text-purple-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.type === 'Result' && '🎓 '}
                                {item.type === 'Announcement' && '📢 '}
                                {item.type === 'Revaluation' && '📝 '}
                                {item.type === 'Notice' && '⚠️ '}
                                {item.type.toLowerCase()}
                              </span>
                              <time className="text-xs text-gray-500" title={new Date(item.date).toLocaleString()}>
                                {new Date(item.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </time>
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:line-clamp-none transition-all duration-200">
                                {item.link ? (
                                  <a 
                                    href={item.link} 
                                    className="hover:text-blue-600 transition-colors flex items-center justify-between group"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <span>{item.title}</span>
                                    <svg className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                ) : (
                                  item.title
                                )}
                              </h3>
                            </div>
                          </div>
                        ))}
                        {/* Duplicate set for seamless loop - needed for continuous scrolling */}
                        {newsItems.map((item) => (
                          <div
                            key={`${item._id}-clone`}
                            className="inline-flex flex-col min-w-[350px] max-w-[350px] flex-none p-5 bg-gray-50 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-gray-100"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                item.type === 'Result' ? 'bg-green-100 text-green-800' :
                                item.type === 'Announcement' ? 'bg-blue-100 text-blue-800' :
                                item.type === 'Revaluation' ? 'bg-purple-100 text-purple-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.type === 'Result' && '🎓 '}
                                {item.type === 'Announcement' && '📢 '}
                                {item.type === 'Revaluation' && '📝 '}
                                {item.type === 'Notice' && '⚠️ '}
                                {item.type.toLowerCase()}
                              </span>
                              <time className="text-xs text-gray-500" title={new Date(item.date).toLocaleString()}>
                                {new Date(item.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </time>
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:line-clamp-none transition-all duration-200">
                                {item.link ? (
                                  <a 
                                    href={item.link} 
                                    className="hover:text-blue-600 transition-colors flex items-center justify-between group"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <span>{item.title}</span>
                                    <svg className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                ) : (
                                  item.title
                                )}
                              </h3>
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
          <Route path="/payment/success" element={<PaymentSuccessPage />} />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
