
import React from 'react';
import SummaryCards from './summary/SummaryCards';
import EquipmentUsageSection from './summary/EquipmentUsageSection';
import FieldStatusSection from './summary/FieldStatusSection';

const OptiFieldSummary: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Dashboard summary cards */}
      <SummaryCards />
      
      {/* Equipment usage section */}
      <EquipmentUsageSection />
      
      {/* Field status section */}
      <FieldStatusSection />
    </div>
  );
};

export default OptiFieldSummary;
