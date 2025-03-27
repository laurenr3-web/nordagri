
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
    staleTime: 0, // Toujours considérer les données comme périmées
    refetchOnWindowFocus: true, // Refetch quand la fenêtre récupère le focus
    refetchInterval: 30000 // Refetch toutes les 30 secondes
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
      toast({
        title: "Erreur de connexion",
        description: "Impossible de charger les données depuis Supabase",
        variant: "destructive",
      });
    }
  }, [isError, initialParts, toast]);

  // Action handlers
  const handleAddPart = (part: Omit<Part, 'id'>) => {
    console.log('👉 Adding part:', part);
    createPartMutation.mutate(part);
  };
  
  const handleUpdatePart = (part: Part) => {
    console.log('👉 Updating part:', part);
    
    // Forcer le rechargement des données après la mise à jour,
    // quelle que soit la réponse de la mutation
    updatePartMutation.mutate(part, {
      onSuccess: (updatedPart) => {
        console.log('🔄 Update successful:', updatedPart);
        // Force un refetch après la mise à jour
        refetch();
      },
      onError: (error) => {
        console.error('❌ Update error:', error);
        // Même en cas d'erreur, on peut essayer de rafraîchir les données
        refetch();
      },
      onSettled: () => {
        // Cette fonction est appelée que la mutation réussisse ou échoue
        console.log('🔄 Forcing data refresh after update attempt');
        refetch();
      }
    });
  };
  
  const handleDeletePart = (partId: number) => {
    console.log('👉 Deleting part:', partId);
    deletePartMutation.mutate(partId, {
      onSuccess: () => {
        console.log('🔄 Refetching parts after delete');
        refetch(); // Force un refetch après la suppression
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
