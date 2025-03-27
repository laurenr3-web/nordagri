
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Part } from '@/types/Part';
import { useToast } from '@/hooks/use-toast';
import { partsService } from '@/services/supabase/partsService';
import { useCreatePart, useUpdatePart, useDeletePart } from '@/hooks/usePartsMutations';

export const usePartsData = (initialParts: Part[] = []) => {
  const { toast } = useToast();
  const [parts, setParts] = useState<Part[]>(initialParts);

  // Mutations
  const createPartMutation = useCreatePart();
  const updatePartMutation = useUpdatePart();
  const deletePartMutation = useDeletePart();

  // Fetch parts using React Query
  const { data: supabaseParts, isLoading, isError } = useQuery({
    queryKey: ['parts'],
    queryFn: () => partsService.getParts(),
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  // Handle data updates
  useEffect(() => {
    if (supabaseParts && supabaseParts.length > 0) {
      console.log('📥 Setting parts from Supabase:', supabaseParts);
      setParts(supabaseParts);
    } else if (supabaseParts && supabaseParts.length === 0 && initialParts.length > 0) {
      console.log('ℹ️ Using initial data as Supabase returned empty');
      setParts(initialParts);
    }
  }, [supabaseParts, initialParts]);

  // Handle error cases
  useEffect(() => {
    if (isError && initialParts.length > 0) {
      console.log('⚠️ Using initial data due to Supabase error');
      setParts(initialParts);
    }
  }, [isError, initialParts]);

  // Action handlers
  const handleAddPart = (part: Omit<Part, 'id'>) => {
    console.log('👉 Adding part:', part);
    createPartMutation.mutate(part);
  };
  
  const handleUpdatePart = (part: Part) => {
    console.log('👉 Updating part:', part);
    updatePartMutation.mutate(part);
  };
  
  const handleDeletePart = (partId: number) => {
    console.log('👉 Deleting part:', partId);
    deletePartMutation.mutate(partId);
  };

  return {
    parts,
    isLoading,
    isError,
    handleAddPart,
    handleUpdatePart,
    handleDeletePart,
  };
};
