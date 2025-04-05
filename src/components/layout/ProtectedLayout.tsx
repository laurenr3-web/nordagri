
import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import MainLayout from '@/ui/layouts/MainLayout';
import MobileNav from '@/components/layout/MobileNav';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      <MainLayout>
        {children}
        <MobileNav />
      </MainLayout>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
