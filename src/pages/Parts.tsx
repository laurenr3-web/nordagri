
import React from 'react';
import PartsContainer from '@/components/parts/PartsContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useParts } from '@/hooks/useParts';

const Parts = () => {
  const partsData = useParts();

  // Create a wrapper function to handle the view change with correct typing
  const handleViewChange = (view: string) => {
    partsData.setCurrentView(view as any);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Gestion des pièces"
        description="Gérez votre inventaire de pièces détachées"
      />
      <PartsContainer 
        {...partsData} 
        setCurrentView={handleViewChange}
      />
    </div>
  );
};

export default Parts;
