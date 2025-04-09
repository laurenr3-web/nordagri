
import { useState } from 'react';
import { SortingState } from '@tanstack/react-query';
import { toast } from 'sonner';

// Define the base equipment type
export interface Equipment {
  id: number | string;
  name: string;
  type?: string;
  manufacturer?: string;
  model?: string;
  year?: string | number;
  serialNumber?: string;
  status?: string;
  location?: string;
  purchaseDate?: string;
  notes?: string;
  image?: string;
}

export function useEquipmentTable() {
  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // Data loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock equipment data
  const [equipments, setEquipments] = useState<Equipment[]>([
    {
      id: 1,
      name: 'Tracteur John Deere',
      type: 'Tractor',
      manufacturer: 'John Deere',
      model: '8R 410',
      year: '2022',
      serialNumber: 'JD8R410-2022-001',
      status: 'operational',
      location: 'Hangar principal',
      image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop'
    },
    {
      id: 2,
      name: 'Moissonneuse Case IH',
      type: 'harvester',
      manufacturer: 'Case IH',
      model: 'Axial-Flow 9250',
      year: '2021',
      serialNumber: 'CASE9250-2021-002',
      status: 'maintenance',
      location: 'Atelier mécanique',
      image: 'https://images.unsplash.com/photo-1599033329459-cc8c31c7eb6c?q=80&w=500&auto=format&fit=crop'
    },
    {
      id: 3,
      name: 'Tracteur Kubota',
      type: 'Tractor',
      manufacturer: 'Kubota',
      model: 'M7-172',
      year: '2020',
      serialNumber: 'KUB-M7172-2020-003',
      status: 'repair',
      location: 'Ferme Est',
      image: 'https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop'
    }
  ]);
  
  // Calculate page count based on total items
  const pageCount = Math.ceil(equipments.length / pageSize);

  // Mock fetch function
  const fetchEquipments = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      console.log('Fetching equipments with pagination:', { pageIndex, pageSize });
      console.log('And sorting:', sorting);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Data is already set in state for this mock
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching equipments:', error);
      toast.error('Erreur lors du chargement des équipements');
      setIsLoading(false);
    }
  };

  // Mock CRUD operations
  const createEquipment = async (data: Partial<Equipment>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newEquipment: Equipment = {
        id: Date.now(),
        name: data.name || 'New Equipment',
        ...data
      };
      
      setEquipments(prev => [...prev, newEquipment]);
      toast.success('Équipement ajouté avec succès');
      return newEquipment;
    } catch (error) {
      console.error('Error creating equipment:', error);
      toast.error('Erreur lors de la création de l\'équipement');
      throw error;
    }
  };

  const updateEquipment = async (id: string | number, data: Partial<Equipment>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEquipments(prev => 
        prev.map(equip => 
          equip.id === id ? { ...equip, ...data } : equip
        )
      );
      
      toast.success('Équipement mis à jour avec succès');
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast.error('Erreur lors de la mise à jour de l\'équipement');
      throw error;
    }
  };

  const deleteEquipment = async (id: string | number) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEquipments(prev => prev.filter(equip => equip.id !== id));
      toast.success('Équipement supprimé avec succès');
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast.error('Erreur lors de la suppression de l\'équipement');
      throw error;
    }
  };

  const importEquipments = async (data: Partial<Equipment>[]) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newEquipments = data.map(item => ({
        id: Date.now() + Math.random(),
        name: item.name || 'Imported Equipment',
        ...item
      }));
      
      setEquipments(prev => [...prev, ...newEquipments]);
      toast.success(`${newEquipments.length} équipements importés avec succès`);
    } catch (error) {
      console.error('Error importing equipments:', error);
      toast.error('Erreur lors de l\'import des équipements');
      throw error;
    }
  };

  return {
    equipments,
    isLoading,
    pageCount,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    setSorting,
    sorting,
    fetchEquipments,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    importEquipments
  };
}
