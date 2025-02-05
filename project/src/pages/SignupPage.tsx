import React from 'react';
import { SignupForm } from '../components/auth/SignupForm';

export const SignupPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SignupForm />
    </div>
  );
};
