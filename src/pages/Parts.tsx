
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { partsData } from '@/data/partsData';
import { useParts } from '@/hooks/useParts';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';

// Import main container
import PartsContainer from '@/components/parts/PartsContainer';

// Sample parts data
const initialPartsData = partsData;

const Parts = () => {
  // The main hook now provides a cleaner interface with more focused sub-hooks
  const partsHookData = useParts(initialPartsData);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        <PartsContainer {...partsHookData} />
      </div>
    </SidebarProvider>
  );
};

export default Parts;
