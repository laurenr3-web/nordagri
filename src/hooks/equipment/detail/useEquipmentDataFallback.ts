
import { useState, useEffect } from 'react';
import { equipmentService } from '@/services/api/equipmentService';
import { toast } from 'sonner';
import { Equipment, EquipmentStatus } from '@/types/models/equipment';

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
        
        // Convert status to a valid EquipmentStatus type
        const validStatus: EquipmentStatus = 
          data.status === 'operational' || 
          data.status === 'maintenance' || 
          data.status === 'repair' || 
          data.status === 'inactive' 
            ? data.status 
            : 'operational'; // Default fallback
        
        // Ensure the data matches the expected format
        const processedData: Equipment = {
          id: data.id,
          name: data.name,
          model: data.model,
          manufacturer: data.manufacturer,
          year: data.year,
          serialNumber: data.serial_number || data.serialNumber,
          purchaseDate: data.purchase_date || data.purchaseDate,
          location: data.location,
          status: validStatus,
          type: data.type || "",
          category: data.category,
          image: data.image,
          notes: data.notes,
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
