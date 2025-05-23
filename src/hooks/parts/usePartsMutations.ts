
import { useCreatePart } from './useCreatePart';
import { useUpdatePart } from './useUpdatePart';
import { useDeletePart } from './useDeletePart';
import { Part } from '@/types/Part';
import { logger } from '@/utils/logger';

export { useCreatePart, useUpdatePart, useDeletePart };

// A focused hook that provides part mutation functionality
export const usePartsMutations = () => {
  const createPartMutation = useCreatePart();
  const updatePartMutation = useUpdatePart();
  const deletePartMutation = useDeletePart();
  
  const handleAddPart = (part: Omit<Part, 'id'>) => {
    logger.log('Adding new part:', part);
    return createPartMutation.mutate(part);
  };
  
  const handleUpdatePart = (part: Part) => {
    // Ensure compatibility is number[]
    const safePart = {
      ...part,
      compatibility: Array.isArray(part.compatibility) 
        ? part.compatibility.map(id => Number(id)) 
        : []
    };
    logger.log('Updating part:', safePart);
    return updatePartMutation.mutate(safePart);
  };
  
  const handleDeletePart = (partId: number | string) => {
    logger.log('Deleting part:', partId);
    return deletePartMutation.mutate(partId);
  };
  
  return {
    handleAddPart,
    handleUpdatePart,
    handleDeletePart,
    isCreating: createPartMutation.isPending,
    isUpdating: updatePartMutation.isPending,
    isDeleting: deletePartMutation.isPending,
    createError: createPartMutation.error,
    updateError: updatePartMutation.error,
    deleteError: deletePartMutation.error
  };
};
