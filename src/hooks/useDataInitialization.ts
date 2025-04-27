import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEquipments } from '@/hooks/equipment/useEquipments';
import { useLocations } from '@/hooks/useLocations';
import { useInterventions } from '@/hooks/useInterventions';
import { useFarms } from '@/hooks/useFarms';
import { useProfiles } from '@/hooks/useProfiles';
import { useParts } from '@/hooks/useParts';
import { compatibilityToStrings } from '@/utils/compatibilityConverter';

export const useDataInitialization = () => {
  const { user, session, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const { refetch: refetchEquipments } = useEquipments();
  const { refetch: refetchLocations } = useLocations();
  const { refetch: refetchInterventions } = useInterventions();
  const { refetch: refetchFarms } = useFarms();
  const { refetch: refetchProfiles } = useProfiles();
  const { refetch: refetchParts } = useParts();

  useEffect(() => {
    if (!isAuthLoading) {
      if (session && user) {
        console.log("Session détectée, initialisation des données...");
        initializeData();
      } else {
        console.log("Aucune session détectée, l'initialisation des données est ignorée.");
      }
    }
  }, [session, user, isAuthLoading, toast, refetchEquipments, refetchLocations, refetchInterventions, refetchFarms, refetchProfiles, refetchParts]);

  const initializeData = async () => {
    try {
      await Promise.all([
        initializeEquipments(),
        initializeLocations(),
        initializeInterventions(),
        initializeFarms(),
        initializeProfiles(),
        initializeParts()
      ]);
      console.log("Toutes les données ont été initialisées avec succès.");
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

  const initializeLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*');
      
      if (error) throw error;
      if (data && data.length > 0) {
        console.log(`${data.length} emplacements trouvés, pas besoin d'initialiser.`);
        return;
      }
      
      console.log("Aucun emplacement trouvé, initialisation...");
      const initialLocations = [
        { name: 'Champ principal' },
        { name: 'Garage' },
        { name: 'Entrepôt' }
      ];
      
      const { error: insertError } = await supabase
        .from('locations')
        .insert(initialLocations);
      
      if (insertError) throw insertError;
      console.log("Emplacements initiaux ajoutés avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'initialisation des emplacements:", error);
    }
  };

  const initializeInterventions = async () => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*');
      
      if (error) throw error;
      if (data && data.length > 0) {
        console.log(`${data.length} interventions trouvées, pas besoin d'initialiser.`);
        return;
      }
      
      console.log("Aucune intervention trouvée, initialisation...");
      const initialInterventions = [
        { title: 'Révision du moteur du tracteur' },
        { title: 'Maintenance de la moissonneuse-batteuse' },
        { title: 'Réparation du semoir' }
      ];
      
      const { error: insertError } = await supabase
        .from('interventions')
        .insert(initialInterventions);
      
      if (insertError) throw insertError;
      console.log("Interventions initiales ajoutées avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'initialisation des interventions:", error);
    }
  };

  const initializeFarms = async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*');
      
      if (error) throw error;
      if (data && data.length > 0) {
        console.log(`${data.length} fermes trouvées, pas besoin d'initialiser.`);
        return;
      }
      
      console.log("Aucune ferme trouvée, initialisation...");
      const initialFarms = [
        { name: 'Ferme de l\'Espoir' }
      ];
      
      const { error: insertError } = await supabase
        .from('farms')
        .insert(initialFarms);
      
      if (insertError) throw insertError;
      console.log("Fermes initiales ajoutées avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'initialisation des fermes:", error);
    }
  };

  const initializeProfiles = async () => {
    try {
      if (!user) {
        console.warn("Utilisateur non connecté, impossible d'initialiser le profil.");
        return;
      }
      
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.message.includes('Aucune ligne trouvée')) {
        console.log("Aucun profil trouvé pour cet utilisateur, initialisation...");
        
        const { data: newProfile, error: newProfileError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, username: user.email }])
          .select()
          .single();
        
        if (newProfileError) throw newProfileError;
        console.log("Profil initial ajouté avec succès:", newProfile);
      } else if (profileError) {
        throw profileError;
      } else {
        console.log("Profil existant trouvé, pas besoin d'initialiser:", existingProfile);
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation des profils:", error);
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
        { name: 'Filtre à air', partNumber: 'AF-123', category: 'Filtres', manufacturer: 'John Deere', compatibility: [1, 2], stock: 10, price: 50, location: 'A1' },
        { name: 'Huile moteur', partNumber: 'MO-456', category: 'Huiles', manufacturer: 'Case IH', compatibility: [3], stock: 5, price: 75, location: 'B2' },
        { name: 'Pneus avant', partNumber: 'TF-789', category: 'Pneus', manufacturer: 'New Holland', compatibility: [1, 3], stock: 3, price: 150, location: 'C3' }
      ];

      // When adding parts to the database, make sure to convert compatibility to string[]
      const formattedParts = initialParts.map(part => ({
        name: part.name,
        part_number: part.partNumber,
        category: part.category,
        supplier: part.manufacturer,
        compatible_with: compatibilityToStrings(part.compatibility), // Convert to string[] for the database
        quantity: part.stock,
        unit_price: part.price, 
        location: part.location,
        reorder_threshold: part.reorderPoint
      }));

      // Now insert each part individually to avoid array insertion issues
      for (const part of formattedParts) {
        await supabase.from('parts_inventory').insert(part);
      }

      console.log("Pièces initiales ajoutées avec succès.");
    } catch (error) {
      console.error("Error initializing parts:", error);
    }
  };
};
