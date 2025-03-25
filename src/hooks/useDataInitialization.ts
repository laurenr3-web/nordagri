
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { maintenanceTasks } from '@/data/maintenanceData';
import { partsData } from '@/data/partsData';

export const useDataInitialization = () => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        console.log('Checking if data initialization is needed...');
        
        // Check if we have a session (user is authenticated)
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) {
          console.log('No authenticated session, skipping data initialization');
          setInitialized(true);
          setLoading(false);
          return;
        }
        
        // Check if maintenance tasks exist
        const { count: tasksCount, error: tasksCountError } = await supabase
          .from('maintenance_tasks')
          .select('*', { count: 'exact', head: true });
          
        if (tasksCountError) throw tasksCountError;
        
        // Check if parts exist
        const { count: partsCount, error: partsCountError } = await supabase
          .from('parts_inventory')
          .select('*', { count: 'exact', head: true });
          
        if (partsCountError) throw partsCountError;
        
        // Check if equipment exists
        const { count: equipmentCount, error: equipmentCountError } = await supabase
          .from('equipment')
          .select('*', { count: 'exact', head: true });
          
        if (equipmentCountError) throw equipmentCountError;
        
        console.log(`Found: ${tasksCount} tasks, ${partsCount} parts, ${equipmentCount} equipment`);
        
        // Insert sample data if needed
        if (tasksCount === 0) {
          console.log('Initializing maintenance tasks...');
          await initializeMaintenanceTasks();
        }
        
        if (partsCount === 0) {
          console.log('Initializing parts inventory...');
          await initializeParts();
        }
        
        if (equipmentCount === 0) {
          console.log('Initializing equipment...');
          await initializeEquipment();
        }
        
        setInitialized(true);
      } catch (err) {
        console.error('Error initializing data:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    // Initialize maintenance tasks
    const initializeMaintenanceTasks = async () => {
      const taskData = maintenanceTasks.map(task => ({
        title: task.title,
        equipment: task.equipment,
        equipment_id: 1, // Default ID
        type: task.type,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate.toISOString(),
        estimated_duration: parseFloat(task.estimatedDuration),
        assigned_to: task.assignedTo,
        notes: task.notes,
        completed_date: task.completedDate ? task.completedDate.toISOString() : null,
        actual_duration: task.actualDuration ? parseFloat(task.actualDuration) : null
      }));
      
      const { error } = await supabase
        .from('maintenance_tasks')
        .insert(taskData);
      
      if (error) throw error;
      console.log('Maintenance tasks initialized successfully');
    };
    
    // Initialize parts inventory
    const initializeParts = async () => {
      const partData = partsData.map(part => ({
        name: part.name,
        part_number: part.partNumber,
        category: part.category,
        supplier: part.manufacturer,
        compatible_with: part.compatibleWith,
        quantity: part.quantity,
        unit_price: part.price ? parseFloat(part.price) : null,
        location: part.location,
        last_ordered: part.lastOrdered?.toISOString(),
        reorder_threshold: part.reorderThreshold
      }));
      
      const { error } = await supabase
        .from('parts_inventory')
        .insert(partData);
      
      if (error) throw error;
      console.log('Parts inventory initialized successfully');
    };
    
    // Initialize equipment
    const initializeEquipment = async () => {
      const equipmentData = [
        {
          name: 'John Deere 8R 410',
          model: '8R 410',
          manufacturer: 'John Deere',
          year: 2022,
          status: 'operational',
          current_location: 'North Field',
          type: 'Tractor',
          category: 'Heavy Equipment'
        },
        {
          name: 'Case IH Axial-Flow',
          model: 'Axial-Flow 250',
          manufacturer: 'Case IH',
          year: 2021,
          status: 'maintenance',
          current_location: 'Equipment Shed',
          type: 'Combine Harvester',
          category: 'Harvesting Equipment'
        },
        {
          name: 'Kubota M7-172',
          model: 'M7-172',
          manufacturer: 'Kubota',
          year: 2020,
          status: 'repair',
          current_location: 'Workshop',
          type: 'Tractor',
          category: 'Medium Equipment'
        }
      ];
      
      const { error } = await supabase
        .from('equipment')
        .insert(equipmentData);
      
      if (error) throw error;
      console.log('Equipment initialized successfully');
    };

    initializeData();
  }, []);

  return { initialized, loading, error };
};
