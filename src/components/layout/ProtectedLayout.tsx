
import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/ui/layouts/MainLayout';
import { LayoutProvider } from '@/ui/layouts/MainLayout';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      <LayoutProvider>
        <MainLayout />
      </LayoutProvider>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
