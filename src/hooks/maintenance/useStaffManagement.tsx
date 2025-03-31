
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useStaffManagement = () => {
  const { toast } = useToast();
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [staffOptions, setStaffOptions] = useState<string[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');

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

  return {
    assignedTo,
    setAssignedTo,
    isAddStaffDialogOpen,
    setIsAddStaffDialogOpen,
    newStaffName,
    setNewStaffName,
    staffOptions,
    handleAddStaff,
    isLoadingStaff
  };
};
