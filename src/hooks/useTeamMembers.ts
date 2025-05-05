
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFarmId } from '@/hooks/useFarmId';

// Définir les interfaces pour les types de données
export interface TeamMember {
  id: string;
  user_id?: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at?: string;
}

// Type guard pour vérifier si un objet est un profil valide
export function isValidProfile(profile: any): profile is { 
  id: string; 
  email: string; 
  first_name: string; 
  last_name: string; 
  farm_id?: string;
} {
  return (
    profile && 
    typeof profile === 'object' &&
    'id' in profile &&
    'email' in profile &&
    'first_name' in profile &&
    'last_name' in profile
  );
}

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { farmId } = useFarmId();

  const fetchTeamData = async (farmId: string) => {
    setLoading(true);
    try {
      console.log("Fetching team data for farm ID:", farmId);
      
      // Récupérer d'abord les utilisateurs depuis profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, farm_id')
        .eq('farm_id', farmId);
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      let members: TeamMember[] = [];
      
      // Si nous avons des profils associés à cette ferme
      if (profilesData && profilesData.length > 0) {
        members = profilesData
          .filter(isValidProfile) // Utiliser le type guard pour filtrer les profils valides
          .map(profile => ({
            id: profile.id,
            user_id: profile.id,
            email: profile.email,
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            role: 'owner', // Par défaut, considérer comme propriétaire
            status: 'active',
            created_at: new Date().toISOString() // Ajouter une date par défaut
          }));
        
        console.log("Found profiles associated with farm:", members);
      } else {
        console.log("No profiles found for this farm ID");
      }
      
      // Essayer de récupérer les membres depuis farm_members si la table existe
      try {
        const { data: farmMembersData, error: membersError } = await supabase
          .from('farm_members')
          .select('id, user_id, role, created_at')
          .eq('farm_id', farmId);
          
        if (membersError) {
          // Si la table n'existe pas, c'est normal
          console.log("Note: farm_members table might not exist yet:", membersError);
        } else if (farmMembersData && farmMembersData.length > 0) {
          console.log("Found farm members:", farmMembersData);
          
          // Pour chaque membre, essayer de récupérer les informations de profil
          for (const member of farmMembersData) {
            if (!member.user_id) continue;

            try {
              const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('first_name, last_name, email')
                .eq('id', member.user_id)
                .single();
                
              if (userError) {
                console.error("Error fetching user data for member:", member.user_id, userError);
                continue; // Passer au membre suivant en cas d'erreur
              }
              
              if (userData && isValidProfile(userData)) {
                const userInfo: TeamMember = {
                  id: member.id || '',
                  user_id: member.user_id || '',
                  email: userData.email,
                  first_name: userData.first_name || '',
                  last_name: userData.last_name || '',
                  role: member.role || 'viewer',
                  status: 'active',
                  created_at: member.created_at || new Date().toISOString()
                };
                
                members.push(userInfo);
              }
            } catch (error) {
              console.error("Error in member processing:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error checking farm_members:", error);
      }
      
      // Récupérer les invitations en attente
      try {
        const { data: pendingInvites, error: invitesError } = await supabase
          .from('invitations')
          .select('*')
          .eq('farm_id', farmId)
          .neq('status', 'accepted');
        
        if (invitesError) {
          console.error("Error fetching invitations:", invitesError);
          // Si la table n'existe pas encore, c'est normal, on continue
        } else if (pendingInvites) {
          // Formater les invitations
          const formattedInvitations: PendingInvitation[] = pendingInvites.map(invite => ({
            id: invite.id || '',
            email: invite.email || '',
            role: invite.role || '',
            status: invite.status || '',
            created_at: invite.created_at || '',
            expires_at: invite.expires_at
          }));
          
          console.log("Pending invitations:", formattedInvitations);
          setInvitations(formattedInvitations);
        }
      } catch (error) {
        console.error("Error processing invitations:", error);
      }
      
      console.log("Team members found:", members);
      
      // Éviter les doublons (si un utilisateur est à la fois dans profiles et farm_members)
      const uniqueMembers = Array.from(
        new Map(members.map(item => [item.user_id, item])).values()
      );
      
      setTeamMembers(uniqueMembers);
      return { teamMembers: uniqueMembers, invitations: invitations };
    } catch (error) {
      console.error('Erreur lors du chargement des données de l\'équipe:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Charger les membres de l'équipe et les invitations
  useEffect(() => {
    if (farmId) {
      fetchTeamData(farmId).catch(error => {
        console.error("Failed to fetch team data:", error);
      });
    }
  }, [farmId]);

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);
        
      if (error) throw error;
      
      // Actualiser les invitations
      if (farmId) {
        await fetchTeamData(farmId);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'invitation:', error);
      throw error;
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    // Pour l'instant, cette fonction simule simplement un renvoi
    console.log("Resending invitation:", invitationId);
    return true;
  };

  return {
    teamMembers,
    invitations,
    loading,
    handleCancelInvitation,
    handleResendInvitation,
    refreshData: () => farmId ? fetchTeamData(farmId) : Promise.resolve()
  };
}
