
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Part } from '@/types/Part';
import { useToast } from '@/hooks/use-toast';
import { getParts } from '@/services/supabase/parts';
import { useCreatePart, useUpdatePart, useDeletePart } from '@/hooks/parts';

export const usePartsData = (initialParts: Part[] = []) => {
  const { toast } = useToast();
  const [parts, setParts] = useState<Part[]>(initialParts);

  // Mutations
  const createPartMutation = useCreatePart();
  const updatePartMutation = useUpdatePart();
  const deletePartMutation = useDeletePart();

  // Fetch parts using React Query
  const { data: supabaseParts, isLoading, isError, refetch } = useQuery({
    queryKey: ['parts'],
    queryFn: () => getParts(),
    staleTime: 0, // Always consider data as stale
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Handle data updates
  useEffect(() => {
    if (supabaseParts && supabaseParts.length > 0) {
      console.log('📥 Setting parts from Supabase:', supabaseParts);
      
      // Filter only real parts (we ensure they have an ID and name)
      const validParts = supabaseParts.filter(part => part.id && part.name);
      
      setParts(validParts);
    } else if (supabaseParts && supabaseParts.length === 0) {
      console.log('ℹ️ No parts in Supabase, setting empty list');
      setParts([]);
    }
  }, [supabaseParts]);

  // Handle error cases
  useEffect(() => {
    if (isError) {
      console.log('⚠️ Error fetching from Supabase, falling back to local data');
      toast({
        title: "Erreur de connexion",
        description: "Impossible de charger les données depuis Supabase",
        variant: "destructive",
      });
    }
  }, [isError, toast]);

  // Action handlers
  const handleAddPart = (part: Omit<Part, 'id'>) => {
    console.log('👉 Adding part:', part);
    createPartMutation.mutate(part);
  };
  
  const handleUpdatePart = (part: Part) => {
    console.log('👉 Updating part:', part);
    
    // Force a data refresh after update, regardless of the mutation response
    updatePartMutation.mutate(part, {
      onSuccess: (updatedPart) => {
        console.log('🔄 Update successful:', updatedPart);
        // Force a refetch after update
        refetch();
      },
      onError: (error) => {
        console.error('❌ Update error:', error);
        // Try to refresh data even on error
        refetch();
      },
      onSettled: () => {
        // This function is called whether the mutation succeeds or fails
        console.log('🔄 Forcing data refresh after update attempt');
        refetch();
      }
    });
  };
  
  const handleDeletePart = (partId: number | string) => {
    console.log('👉 Deleting part:', partId);
    deletePartMutation.mutate(partId, {
      onSuccess: () => {
        console.log('🔄 Refetching parts after delete');
        refetch(); // Force a refetch after deletion
      }
    });
  };

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
