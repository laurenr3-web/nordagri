
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { PartsContextProvider } from '@/contexts/PartsContext';
import PartsPageContainer from '@/components/parts/page/PartsPageContainer';

const Parts = () => {
  console.log("Parts component rendering with context provider");
  
  return (
    <SidebarProvider>
      <PartsContextProvider>
        <PartsPageContainer />
      </PartsContextProvider>
    </SidebarProvider>
  );
};

export default Parts;
