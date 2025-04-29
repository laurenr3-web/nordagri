
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { OfflineProvider } from '@/providers/OfflineProvider';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <OfflineProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <OfflineIndicator />
        <Footer />
      </div>
    </OfflineProvider>
  );
};

export default AppLayout;
