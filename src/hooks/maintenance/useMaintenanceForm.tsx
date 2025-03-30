
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MaintenanceFormValues, MaintenancePriority, MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';
import { equipmentService } from '@/services/supabase/equipmentService';
import { supabase } from '@/integrations/supabase/client';

export const useMaintenanceForm = (
  onSubmit: (values: MaintenanceFormValues) => void, 
  onClose: (open: boolean) => void,
  initialDate?: Date
) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [equipmentId, setEquipmentId] = useState(1);
  const [type, setType] = useState<MaintenanceType>('preventive');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');
  const [dueDate, setDueDate] = useState<Date>(initialDate || new Date());
  const [engineHours, setEngineHours] = useState('0');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Update dueDate when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setDueDate(initialDate);
    }
  }, [initialDate]);
  
  // Staff management
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [staffOptions, setStaffOptions] = useState<string[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Fetch staff members from the database
  useEffect(() => {
    const fetchStaffMembers = async () => {
      setIsLoadingStaff(true);
      try {
        // First get the current user's farm
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) {
          setIsLoadingStaff(false);
          return;
        }
        
        // Get the user's farm
        const { data: farmData, error: farmError } = await supabase
          .from('farms')
          .select('id')
          .eq('owner_id', sessionData.session.user.id)
          .maybeSingle();
          
        if (farmError) throw farmError;
        
        if (!farmData) {
          setIsLoadingStaff(false);
          setStaffOptions([]);
          return;
        }
        
        // Now get the team members for this farm
        const { data: teamData, error: teamError } = await supabase
          .from('team_members')
          .select('name')
          .eq('farm_id', farmData.id);
          
        if (teamError) throw teamError;
        
        if (teamData && teamData.length > 0) {
          const staffNames = teamData.map(member => member.name);
          setStaffOptions(staffNames);
        } else {
          // Fallback to current user's name if no team members found
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', sessionData.session.user.id)
            .single();
            
          if (profileData) {
            const fullName = `${profileData.first_name} ${profileData.last_name}`.trim();
            if (fullName) {
              setStaffOptions([fullName]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching staff members:', error);
        // Fallback to empty array
        setStaffOptions([]);
      } finally {
        setIsLoadingStaff(false);
      }
    };

    fetchStaffMembers();
  }, []);

  // Equipment options
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
  }, []);

  const handleEquipmentChange = (value: string) => {
    const selected = equipmentOptions.find(eq => eq.name === value);
    if (selected) {
      setEquipment(value);
      setEquipmentId(selected.id);
    }
  };

  const handleAddStaff = async () => {
    if (newStaffName.trim() === '') {
      toast({
        title: "Erreur",
        description: "Le nom de la personne ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        throw new Error("Session utilisateur non trouvée");
      }
      
      // Get the user's farm
      const { data: farmData, error: farmError } = await supabase
        .from('farms')
        .select('id')
        .eq('owner_id', sessionData.session.user.id)
        .maybeSingle();
        
      if (farmError) throw farmError;
      
      if (!farmData) {
        throw new Error("Informations de ferme non trouvées");
      }
      
      // Add the new staff member to the team_members table
      const { error: insertError } = await supabase
        .from('team_members')
        .insert({
          farm_id: farmData.id,
          name: newStaffName.trim(),
          role: 'Mechanic'  // Default role for maintenance staff
        });
        
      if (insertError) throw insertError;
      
      // Update local state
      const updatedStaffOptions = [...staffOptions, newStaffName.trim()];
      setStaffOptions(updatedStaffOptions);
      setAssignedTo(newStaffName.trim());
      setNewStaffName('');
      setIsAddStaffDialogOpen(false);
      
      toast({
        title: "Personne ajoutée",
        description: `${newStaffName.trim()} a été ajouté(e) à la liste du personnel`,
      });
    } catch (error: any) {
      console.error('Error adding staff member:', error);
      toast({
        title: "Erreur",
        description: `Impossible d'ajouter la personne: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: MaintenanceFormValues = {
      title,
      equipment,
      equipmentId,
      type,
      priority,
      dueDate,
      engineHours: parseFloat(engineHours),
      assignedTo,
      notes,
    };
    
    onSubmit(formData);
    onClose(false);
    
    // Reset form
    setTitle('');
    setEquipment('');
    setEquipmentId(1);
    setType('preventive');
    setPriority('medium');
    setDueDate(new Date());
    setEngineHours('0');
    setAssignedTo('');
    setNotes('');
  };

  return {
    // Form values
    title,
    setTitle,
    equipment,
    setEquipment,
    equipmentId,
    type,
    setType,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    engineHours,
    setEngineHours,
    assignedTo,
    setAssignedTo,
    notes,
    setNotes,
    
    // Staff management
    isAddStaffDialogOpen,
    setIsAddStaffDialogOpen,
    newStaffName,
    setNewStaffName,
    staffOptions,
    handleAddStaff,
    isLoadingStaff,
    
    // Equipment options
    equipmentOptions,
    handleEquipmentChange,
    isLoading,
    
    // Form submission
    handleSubmit,
  };
};
