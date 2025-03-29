
import React from 'react';
import PriceComparisonTab from './PriceComparisonTab';

interface PartPriceComparisonProps {
  partReference: string;
  partName?: string;
  partManufacturer?: string;
}

const PartPriceComparison: React.FC<PartPriceComparisonProps> = ({
  partReference,
  partName,
  partManufacturer
}) => {
  return (
    <PriceComparisonTab 
      partNumber={partReference}
      partName={partName}
      manufacturer={partManufacturer}
    />
  );
};

export default PartPriceComparison;
