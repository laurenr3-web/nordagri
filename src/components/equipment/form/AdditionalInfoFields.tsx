
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
}

const AdditionalInfoFields: React.FC<AdditionalInfoFieldsProps> = ({ form }) => {
  return (
    <>
      <YearField form={form} />
      <SerialNumberField form={form} />
      <StatusField form={form} />
      <LocationField form={form} />
      <PurchaseDateField form={form} />
    </>
  );
};

export default AdditionalInfoFields;
