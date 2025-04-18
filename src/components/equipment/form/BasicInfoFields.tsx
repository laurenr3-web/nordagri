
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EquipmentFormValues } from './equipmentFormTypes';
import NameField from './fields/NameField';
import ModelField from './fields/ModelField';
import { EquipmentTypeField } from './fields/EquipmentTypeField';

interface BasicInfoFieldsProps {
  form: UseFormReturn<EquipmentFormValues>;
  language?: 'fr' | 'en';
  customCategories?: string[];
  onAddCategoryClick?: () => void;
  onAddCustomType?: (type: string) => Promise<any>;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ 
  form, 
  language = 'fr',
  customCategories = [],
  onAddCategoryClick,
  onAddCustomType
}) => {
  return (
    <div className="space-y-4">
      <NameField form={form} />
      <ModelField form={form} />
      <EquipmentTypeField 
        form={form} 
        language={language}
        onAddCustomType={onAddCustomType}
      />
    </div>
  );
};

export default BasicInfoFields;
