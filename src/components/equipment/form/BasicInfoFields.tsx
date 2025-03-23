
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EquipmentFormValues } from './equipmentFormTypes';
import NameField from './fields/NameField';
import TypeField from './fields/TypeField';
import CategoryField from './fields/CategoryField';
import ManufacturerField from './fields/ManufacturerField';
import ModelField from './fields/ModelField';

interface BasicInfoFieldsProps {
  form: UseFormReturn<EquipmentFormValues>;
  customCategories: string[];
  onAddCategoryClick: () => void;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ 
  form, 
  customCategories, 
  onAddCategoryClick 
}) => {
  return (
    <>
      <NameField form={form} />
      <TypeField form={form} />
      <CategoryField 
        form={form} 
        customCategories={customCategories} 
        onAddCategoryClick={onAddCategoryClick} 
      />
      <ManufacturerField form={form} />
      <ModelField form={form} />
    </>
  );
};

export default BasicInfoFields;
