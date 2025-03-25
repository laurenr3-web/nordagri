
import { useMemo } from 'react';
import { Part } from '@/types/Part';

export const usePartsCategories = (parts: Part[]) => {
  // Get all unique categories from parts
  const categories = useMemo(() => {
    return Array.from(
      new Set(['all', ...parts.map(part => part.category).filter(Boolean)])
    );
  }, [parts]);
  
  // Get all unique manufacturers for filter
  const manufacturers = useMemo(() => {
    return Array.from(
      new Set(parts.map(part => part.manufacturer).filter(Boolean))
    );
  }, [parts]);

  return {
    categories,
    manufacturers
  };
};
