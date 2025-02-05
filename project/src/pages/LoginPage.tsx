import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/users/login', { usn, password });
      localStorage.setItem('token', data.token);
      
      // Check for redirect URL
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin'); // Clear it after use
      
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};