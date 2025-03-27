
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
  language?: 'en' | 'fr';
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ 
  form, 
  customCategories, 
  onAddCategoryClick,
  language = 'fr'
}) => {
  const labels = {
    name: language === 'fr' ? "Nom de l'équipement*" : "Equipment Name*",
    type: language === 'fr' ? "Type*" : "Type*",
    category: language === 'fr' ? "Catégorie*" : "Category*",
    manufacturer: language === 'fr' ? "Fabricant*" : "Manufacturer*",
    model: language === 'fr' ? "Modèle" : "Model",
  };

  const placeholders = {
    name: language === 'fr' ? "John Deere 8R 410" : "John Deere 8R 410",
    type: language === 'fr' ? "Sélectionner un type" : "Select type",
    category: language === 'fr' ? "Sélectionner une catégorie" : "Select category",
    manufacturer: language === 'fr' ? "John Deere" : "John Deere",
    model: language === 'fr' ? "8R 410" : "8R 410",
  };

  const addButtonText = language === 'fr' ? "Ajouter une catégorie" : "Add Category";

  return (
    <div className="space-y-4">
      <NameField 
        form={form} 
        label={labels.name} 
        placeholder={placeholders.name} 
      />
      
      <TypeField 
        form={form} 
        label={labels.type} 
        placeholder={placeholders.type} 
      />
      
      <CategoryField 
        form={form} 
        customCategories={customCategories} 
        onAddCategoryClick={onAddCategoryClick}
        label={labels.category}
        placeholder={placeholders.category}
        addButtonText={addButtonText}
      />

      <ManufacturerField 
        form={form} 
        label={labels.manufacturer} 
        placeholder={placeholders.manufacturer} 
      />
      
      <ModelField 
        form={form} 
        label={labels.model} 
        placeholder={placeholders.model} 
      />
    </div>
  );
};

export default BasicInfoFields;
