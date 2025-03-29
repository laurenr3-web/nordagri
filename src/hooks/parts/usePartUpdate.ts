
import { Part } from '@/types/Part';
import { useUpdatePart } from '@/hooks/parts/useUpdatePart';

export const usePartUpdate = (parts: Part[], setParts: (parts: Part[]) => void, refetch: () => void, toast: any) => {
  const updatePartMutation = useUpdatePart();
  
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

  return { handleUpdatePart };
};
