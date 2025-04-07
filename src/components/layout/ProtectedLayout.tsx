
import React, { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import MainLayout from '@/ui/layouts/MainLayout';
import { LayoutProvider } from '@/ui/layouts/MainLayoutContext';

interface ProtectedLayoutProps {
  children: ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      <LayoutProvider>
        <MainLayout>
          {children}
        </MainLayout>
      </LayoutProvider>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
