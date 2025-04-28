
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEquipments } from '@/hooks/equipment/useEquipments';
import { useParts } from '@/hooks/useParts';
import { compatibilityToStrings } from '@/utils/compatibilityConverter';

export const useDataInitialization = () => {
  const { toast } = useToast();
  const { refetch: refetchEquipments } = useEquipments();
  const { refetch: refetchParts } = useParts();

  useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session && sessionData.session.user) {
        console.log("Session détectée, initialisation des données...");
        initializeData();
      } else {
        console.log("Aucune session détectée, l'initialisation des données est ignorée.");
      }
    };
    
    checkSession();
  }, [toast, refetchEquipments, refetchParts]);

  const initializeData = async () => {
    try {
      await Promise.all([
        initializeEquipments(),
        initializeParts()
      ]);
      console.log("Données essentielles initialisées avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'initialisation des données:", error);
      toast({
        title: "Erreur d'initialisation",
        description: "Une erreur s'est produite lors du chargement initial des données.",
        variant: "destructive",
      });
    }
  };

  const initializeEquipments = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*');
      
      if (error) throw error;
      if (data && data.length > 0) {
        console.log(`${data.length} équipements trouvés, pas besoin d'initialiser.`);
        return;
      }
      
      console.log("Aucun équipement trouvé, initialisation...");
      const initialEquipments = [
        { name: 'Tracteur John Deere 8R 410' },
        { name: 'Moissonneuse-batteuse Case IH Axial-Flow' },
        { name: 'Semoir New Holland P2080' }
      ];
      
      const { error: insertError } = await supabase
        .from('equipment')
        .insert(initialEquipments);
      
      if (insertError) throw insertError;
      console.log("Équipements initiaux ajoutés avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'initialisation des équipements:", error);
    }
  };

  // Find the specific function where the error is happening and update it to use our utility
  const initializeParts = async () => {
    try {
      const { data, error } = await supabase
        .from('parts_inventory')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        console.log(`${data.length} parts trouvées, pas besoin d'initialiser.`);
        return;
      }

      console.log("Aucune pièce trouvée, initialisation...");
      const initialParts = [
        { 
          name: 'Filtre à air', 
          part_number: 'AF-123', 
          category: 'Filtres', 
          supplier: 'John Deere', 
          compatible_with: ['1', '2'], // Use strings here, not numbers
          quantity: 10, 
          unit_price: 50, 
          location: 'A1',
          reorder_threshold: 5
        },
        { 
          name: 'Huile moteur', 
          part_number: 'MO-456', 
          category: 'Huiles', 
          supplier: 'Case IH', 
          compatible_with: ['3'], 
          quantity: 5, 
          unit_price: 75, 
          location: 'B2',
          reorder_threshold: 3
        },
        { 
          name: 'Pneus avant', 
          part_number: 'TF-789', 
          category: 'Pneus', 
          supplier: 'New Holland', 
          compatible_with: ['1', '3'], 
          quantity: 3, 
          unit_price: 150, 
          location: 'C3',
          reorder_threshold: 2
        }
      ];

      // Now insert each part individually to avoid array insertion issues
      for (const part of initialParts) {
        await supabase.from('parts_inventory').insert(part);
      }

      console.log("Pièces initiales ajoutées avec succès.");
    } catch (error) {
      console.error("Error initializing parts:", error);
    }
  };
};
