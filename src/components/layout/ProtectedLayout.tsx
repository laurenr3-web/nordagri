
import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import MainLayout from '@/ui/layouts/MainLayout';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      <MainLayout>
        {children}
        {/* MobileNav est déjà géré par le composant MobileMenu dans App.tsx */}
      </MainLayout>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
