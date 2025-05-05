
import { useState, useEffect } from 'react';
import { useFarmId } from '@/hooks/useFarmId';
import { TeamMember, PendingInvitation } from '@/types/TeamMember';
import { 
  fetchTeamData, 
  cancelInvitation, 
  resendInvitation 
} from '@/services/teamService';

export { TeamMember, PendingInvitation };

/**
 * Hook for managing team members and invitations
 */
export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { farmId } = useFarmId();

  const loadTeamData = async (farmId: string) => {
    setLoading(true);
    try {
      const data = await fetchTeamData(farmId);
      setTeamMembers(data.teamMembers);
      setInvitations(data.invitations);
      return data;
    } catch (error) {
      console.error('Error loading team data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Load team members and invitations when farmId changes
  useEffect(() => {
    if (farmId) {
      loadTeamData(farmId).catch(error => {
        console.error("Failed to fetch team data:", error);
      });
    }
  }, [farmId]);

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const success = await cancelInvitation(invitationId);
      
      // Refresh team data if successful
      if (success && farmId) {
        await loadTeamData(farmId);
      }
      
      return success;
    } catch (error) {
      console.error('Error canceling invitation:', error);
      throw error;
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const success = await resendInvitation(invitationId);
      return success;
    } catch (error) {
      console.error('Error resending invitation:', error);
      throw error;
    }
  };

  return {
    teamMembers,
    invitations,
    loading,
    handleCancelInvitation,
    handleResendInvitation,
    refreshData: () => farmId ? loadTeamData(farmId) : Promise.resolve()
  };
}
