
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EquipmentFormValues } from './equipmentFormTypes';
import NameField from './fields/NameField';
import ModelField from './fields/ModelField';
import { EquipmentTypeField } from './fields/EquipmentTypeField';

interface BasicInfoFieldsProps {
  form: UseFormReturn<EquipmentFormValues>;
  language?: 'fr' | 'en';
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ 
  form, 
  language = 'fr'
}) => {
  return (
    <div className="space-y-4">
      <NameField form={form} />
      <ModelField form={form} />
      <EquipmentTypeField form={form} language={language} />
    </div>
  );
};

export default BasicInfoFields;
