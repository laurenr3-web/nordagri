
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Technician {
  id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
}

export function useTechnicians() {
  return useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      try {
        // Fetch team members with role containing 'tech' or 'maintenance'
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .or('role.ilike.%tech%,role.ilike.%maintenance%');
          
        if (error) {
          throw error;
        }
        
        // Format technicians for dropdown
        return data.map(tech => ({
          id: tech.id,
          name: tech.name,
          role: tech.role,
          email: tech.email,
          phone: tech.phone
        })) as Technician[];
      } catch (error) {
        console.error('Error fetching technicians:', error);
        return [];
      }
    }
  });
}
