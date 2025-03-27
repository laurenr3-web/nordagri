
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EquipmentFormValues } from './equipmentFormTypes';
import YearField from './fields/YearField';
import SerialNumberField from './fields/SerialNumberField';
import StatusField from './fields/StatusField';
import LocationField from './fields/LocationField';
import PurchaseDateField from './fields/PurchaseDateField';

interface AdditionalInfoFieldsProps {
  form: UseFormReturn<EquipmentFormValues>;
  language?: 'en' | 'fr';
}

const AdditionalInfoFields: React.FC<AdditionalInfoFieldsProps> = ({ 
  form,
  language = 'fr'
}) => {
  const labels = {
    year: language === 'fr' ? 'Année*' : 'Year*',
    serialNumber: language === 'fr' ? 'Numéro de série' : 'Serial Number',
    status: language === 'fr' ? 'Statut' : 'Status',
    location: language === 'fr' ? 'Emplacement' : 'Location',
    purchaseDate: language === 'fr' ? 'Date d\'achat' : 'Purchase Date',
  };

  const placeholders = {
    year: language === 'fr' ? '2023' : '2023',
    serialNumber: language === 'fr' ? 'JD8R410-2022-1234' : 'JD8R410-2022-1234',
    location: language === 'fr' ? 'Champ Nord' : 'North Field',
    status: language === 'fr' ? 'Sélectionner un statut' : 'Select status',
    date: language === 'fr' ? 'Sélectionner une date' : 'Select date',
  };

  const statusOptions = language === 'fr' 
    ? [
        { value: 'operational', label: 'Opérationnel' },
        { value: 'maintenance', label: 'En maintenance' },
        { value: 'repair', label: 'En réparation' },
        { value: 'retired', label: 'Retiré' },
      ]
    : [
        { value: 'operational', label: 'Operational' },
        { value: 'maintenance', label: 'In Maintenance' },
        { value: 'repair', label: 'Needs Repair' },
        { value: 'retired', label: 'Retired' },
      ];

  return (
    <div className="space-y-4">
      <YearField 
        form={form} 
        label={labels.year} 
        placeholder={placeholders.year} 
      />
      
      <StatusField 
        form={form} 
        label={labels.status} 
        statusOptions={statusOptions} 
        placeholder={placeholders.status} 
      />
      
      <LocationField 
        form={form} 
        label={labels.location} 
        placeholder={placeholders.location} 
      />
      
      <SerialNumberField 
        form={form} 
        label={labels.serialNumber} 
        placeholder={placeholders.serialNumber} 
      />
      
      <PurchaseDateField 
        form={form} 
        label={labels.purchaseDate} 
        placeholder={placeholders.date} 
        language={language}
      />
    </div>
  );
};

export default AdditionalInfoFields;
