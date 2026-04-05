
import React from 'react';
import { PlanningContent } from '@/components/planning/PlanningContent';

const Planning = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold mb-4">Planification</h1>
        <PlanningContent />
      </div>
    </div>
  );
};

export default Planning;
