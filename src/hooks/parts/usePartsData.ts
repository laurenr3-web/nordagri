
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
    
    // Valider les champs obligatoires
    if (!part.name || !part.partNumber || !part.category) {
      toast({
        title: "Erreur de validation",
        description: "Nom, Numéro de pièce et Catégorie sont obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    // S'assurer que les valeurs numériques sont correctes
    const processedPart = {
      ...part,
      price: typeof part.price === 'number' ? part.price : parseFloat(part.price as unknown as string) || 0,
      stock: typeof part.stock === 'number' ? part.stock : parseInt(part.stock as unknown as string) || 0,
      reorderPoint: typeof part.reorderPoint === 'number' ? part.reorderPoint : parseInt(part.reorderPoint as unknown as string) || 1,
      compatibility: Array.isArray(part.compatibility) ? part.compatibility : [],
    };
    
    // Mut temporairement dans l'état local pour améliorer la UX
    const tempId = `temp-${Date.now()}`;
    const tempPart = { ...processedPart, id: tempId } as Part;
    setParts([...parts, tempPart]);
    
    // Soumettre à l'API
    createPartMutation.mutate(processedPart, {
      onSuccess: (data) => {
        toast({
          title: "Pièce ajoutée",
          description: `${part.name} a été ajouté à l'inventaire`,
        });
        refetch();
      },
      onError: (error) => {
        toast({
          title: "Erreur",
          description: `Impossible d'ajouter la pièce: ${error.message}`,
          variant: "destructive",
        });
        // Enlever la pièce temporaire
        setParts(parts.filter(p => p.id !== tempId));
      }
    });
  };
  
  const handleUpdatePart = (part: Part) => {
    console.log('👉 Updating part:', part);
    
    // Valider les champs obligatoires
    if (!part.name || !part.partNumber || !part.category) {
      toast({
        title: "Erreur de validation",
        description: "Nom, Numéro de pièce et Catégorie sont obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    // S'assurer que les valeurs numériques sont correctes
    const processedPart = {
      ...part,
      price: typeof part.price === 'number' ? part.price : parseFloat(part.price as unknown as string) || 0,
      stock: typeof part.stock === 'number' ? part.stock : parseInt(part.stock as unknown as string) || 0,
      reorderPoint: typeof part.reorderPoint === 'number' ? part.reorderPoint : parseInt(part.reorderPoint as unknown as string) || 1,
      compatibility: Array.isArray(part.compatibility) ? part.compatibility : [],
    };
    
    // Mettre à jour localement pour améliorer la UX
    setParts(parts.map(p => p.id === part.id ? processedPart : p));
    
    // Forcer le rechargement des données après la mise à jour,
    // quelle que soit la réponse de la mutation
    updatePartMutation.mutate(processedPart, {
      onSuccess: (updatedPart) => {
        console.log('🔄 Update successful:', updatedPart);
        toast({
          title: "Pièce mise à jour",
          description: `${part.name} a été mise à jour`,
        });
        // Force un refetch après la mise à jour
        refetch();
      },
      onError: (error) => {
        console.error('❌ Update error:', error);
        toast({
          title: "Erreur de mise à jour",
          description: error.message,
          variant: "destructive",
        });
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
  
  const handleDeletePart = (partId: number | string) => {
    console.log('👉 Deleting part:', partId);
    
    // Vérifier si la pièce existe
    const partToDelete = parts.find(p => p.id === partId);
    if (!partToDelete) {
      toast({
        title: "Erreur",
        description: "Pièce introuvable",
        variant: "destructive",
      });
      return;
    }
    
    // Feedback visuel immédiat
    setParts(parts.filter(p => p.id !== partId));
    
    deletePartMutation.mutate(partId, {
      onSuccess: () => {
        console.log('🔄 Refetching parts after delete');
        toast({
          title: "Pièce supprimée",
          description: `${partToDelete.name} a été supprimée de l'inventaire`,
        });
        refetch(); // Force un refetch après la suppression
      },
      onError: (error) => {
        toast({
          title: "Erreur de suppression",
          description: error.message,
          variant: "destructive",
        });
        // Restaurer la pièce dans l'état local
        setParts([...parts]);
        refetch();
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
