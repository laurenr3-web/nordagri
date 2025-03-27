
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
      <NameField form={form} label="Nom de l'équipement*" placeholder="John Deere 8R 410" />
      <TypeField form={form} label="Type*" placeholder="Sélectionner un type" />
      <CategoryField 
        form={form} 
        customCategories={customCategories} 
        onAddCategoryClick={onAddCategoryClick} 
        label="Catégorie*"
        placeholder="Sélectionner une catégorie"
        addButtonText="+ Ajouter une catégorie"
      />
      <ManufacturerField form={form} label="Fabricant*" placeholder="John Deere" />
      <ModelField form={form} label="Modèle" placeholder="8R 410" />
    </>
  );
};

export default BasicInfoFields;
