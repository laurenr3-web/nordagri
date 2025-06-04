
import React from 'react';
import PartsContainer from '@/components/parts/PartsContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useParts } from '@/hooks/useParts';

const Parts = () => {
  const partsData = useParts();

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Gestion des pièces"
        description="Gérez votre inventaire de pièces détachées"
      />
      <PartsContainer {...partsData} />
    </div>
  );
};

export default Parts;
