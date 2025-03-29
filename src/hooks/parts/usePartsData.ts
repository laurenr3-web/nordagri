
import { Part } from '@/types/Part';
import { usePartsLoading } from './usePartsLoading';
import { usePartsToast } from './usePartsToast';
import { usePartAdd } from './usePartAdd';
import { usePartUpdate } from './usePartUpdate';
import { usePartDelete } from './usePartDelete';

export const usePartsData = (initialParts: Part[] = []) => {
  // Use the loading hook to fetch data
  const { parts, setParts, isLoading, isError, refetch } = usePartsLoading(initialParts);
  
  // Initialize toast notifications
  const { toast } = usePartsToast(isError, initialParts);
  
  // Initialize CRUD operations
  const { handleAddPart } = usePartAdd(parts, setParts, refetch, toast);
  const { handleUpdatePart } = usePartUpdate(parts, setParts, refetch, toast);
  const { handleDeletePart } = usePartDelete(parts, setParts, refetch, toast);

  return {
    parts,
    isLoading,
    isError,
    refetch,
    handleAddPart,
    handleUpdatePart,
    handleDeletePart,
  };
};
