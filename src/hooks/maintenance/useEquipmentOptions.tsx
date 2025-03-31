
import { useState, useEffect } from 'react';
import { equipmentService } from '@/services/supabase/equipmentService';

export const useEquipmentOptions = () => {
  const [equipment, setEquipment] = useState('');
  const [equipmentId, setEquipmentId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [equipmentOptions, setEquipmentOptions] = useState<Array<{ id: number; name: string }>>([]);

  // Fetch real equipment from the database
  useEffect(() => {
    const fetchEquipment = async () => {
      setIsLoading(true);
      try {
        const data = await equipmentService.getEquipment();
        const mappedEquipment = data.map(item => ({
          id: item.id,
          name: item.name
        }));
        setEquipmentOptions(mappedEquipment);
        
        // Set default equipment if available
        if (mappedEquipment.length > 0 && !equipment) {
          setEquipment(mappedEquipment[0].name);
          setEquipmentId(mappedEquipment[0].id);
        }
      } catch (error) {
        console.error('Error fetching equipment:', error);
        // Fall back to mock data if there's an error
        const fallbackOptions = [
          { id: 1, name: 'John Deere 8R 410' },
          { id: 2, name: 'Case IH Axial-Flow' },
          { id: 3, name: 'Kubota M7-172' },
          { id: 4, name: 'Massey Ferguson 8S.245' },
          { id: 5, name: 'New Holland T6.180' },
          { id: 6, name: 'Fendt 942 Vario' },
        ];
        setEquipmentOptions(fallbackOptions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipment();
  }, [equipment]);

  const handleEquipmentChange = (value: string) => {
    const selected = equipmentOptions.find(eq => eq.name === value);
    if (selected) {
      setEquipment(value);
      setEquipmentId(selected.id);
    }
  };

  return {
    equipment,
    setEquipment,
    equipmentId,
    equipmentOptions,
    handleEquipmentChange,
    isLoading
  };
};
