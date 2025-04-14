
import { useState, useEffect } from 'react';
import { equipmentService } from '@/services/api/equipmentService';
import { toast } from 'sonner';
import { Equipment } from '@/types/models/equipment';

export function useEquipmentDataFallback(id: string | undefined) {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);
  
  useEffect(() => {
    const fetchEquipment = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('Fetching equipment with ID:', id);
        
        const data = await equipmentService.getEquipmentById(Number(id));
        
        if (!data) {
          throw new Error('Équipement non trouvé');
        }
        
        // Vérifiez si nous utilisons des données de démonstration
        if (data.id === 1 && data.name === "Tracteur John Deere 6130R") {
          setUsingDemoData(true);
          console.info("Utilisation des données de démonstration pour l'équipement");
          toast.info("Données de démonstration utilisées pour cet équipement");
        } else {
          setUsingDemoData(false);
        }
        
        // Ensure the data matches the expected format
        const processedData: Equipment = {
          ...data,
          purchaseDate: data.purchase_date || data.purchaseDate,
          serialNumber: data.serial_number || data.serialNumber,
          type: data.type || "",  // Ajout de type car c'est requis
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at || new Date().toISOString()
        };
        
        setEquipment(processedData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching equipment:', err);
        setError(err.message || 'Failed to load equipment');
        setUsingDemoData(true);
        toast.error("Erreur lors du chargement de l'équipement - utilisation des données de démonstration");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEquipment();
  }, [id]);

  return { 
    equipment, 
    setEquipment,
    loading, 
    error,
    usingDemoData
  };
}
