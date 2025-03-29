
import { Part } from '@/types/Part';
import { useCreatePart } from '@/hooks/parts/useCreatePart';

export const usePartAdd = (parts: Part[], setParts: (parts: Part[]) => void, refetch: () => void, toast: any) => {
  const createPartMutation = useCreatePart();

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
    
    // Ajouter temporairement dans l'état local pour améliorer la UX
    const tempId = `temp-${Date.now()}`;
    const tempPart = { ...processedPart, id: tempId } as Part;
    
    // Utiliser setTimeout pour éviter les conflits de state
    setTimeout(() => {
      setParts([...parts, tempPart]);
      
      // Soumettre à l'API
      createPartMutation.mutate(processedPart, {
        onSuccess: () => {
          toast({
            title: "Pièce ajoutée",
            description: `${part.name} a été ajouté à l'inventaire`,
          });
          
          // Utiliser setTimeout pour le refetch également
          setTimeout(() => {
            refetch();
          }, 100);
        },
        onError: (error) => {
          toast({
            title: "Erreur",
            description: `Impossible d'ajouter la pièce: ${error.message}`,
            variant: "destructive",
          });
          
          // Enlever la pièce temporaire
          setTimeout(() => {
            setParts(parts.filter(p => p.id !== tempId));
          }, 100);
        }
      });
    }, 0);
  };

  return { handleAddPart };
};
