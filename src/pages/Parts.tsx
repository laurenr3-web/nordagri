
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { partsData } from '@/data/partsData';
import { useParts } from '@/hooks/useParts';

// Import main container
import PartsContainer from '@/components/parts/PartsContainer';

// Sample parts data
const initialPartsData = partsData;

const Parts = () => {
  const partsHookData = useParts(initialPartsData);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PartsContainer {...partsHookData} />
    </div>
  );
};

export default Parts;
