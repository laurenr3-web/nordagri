
import React, { useState, useEffect } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFarmId } from '@/hooks/useFarmId';
import { TeamMembersList } from './components/TeamMembersList';
import { PendingInvitationsList } from './components/PendingInvitationsList';
import { RoleDescriptions } from './components/RoleDescriptions';
import { InviteUserDialog } from '../users/InviteUserDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Composant pour afficher et gérer les accès utilisateurs et techniciens
 */
export function UserAccessSection() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { farmId, isLoading: farmIdLoading } = useFarmId();

  // Charger les membres de l'équipe et les invitations
  useEffect(() => {
    if (farmId) {
      fetchTeamData(farmId);
    }
  }, [farmId]);
  
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
      
      let members: any[] = [];
      
      // Si nous avons des profils associés à cette ferme
      if (profilesData && profilesData.length > 0) {
        members = profilesData.map(profile => ({
          id: profile.id,
          user_id: profile.id,
          email: profile.email || '',
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
              
              if (userData) {
                members.push({
                  id: member.id,
                  user_id: member.user_id,
                  email: userData.email || '',
                  first_name: userData.first_name || '',
                  last_name: userData.last_name || '',
                  role: member.role || 'viewer',
                  status: 'active',
                  created_at: member.created_at || new Date().toISOString()
                });
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
        } else {
          // Formater les invitations
          const formattedInvitations = pendingInvites?.map(invite => ({
            id: invite.id,
            email: invite.email,
            role: invite.role,
            status: invite.status,
            created_at: invite.created_at,
            expires_at: invite.expires_at
          })) || [];
          
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
    } catch (error) {
      console.error('Erreur lors du chargement des données de l\'équipe:', error);
      toast.error('Impossible de charger les membres de l\'équipe');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);
        
      if (error) throw error;
      
      toast.success('Invitation annulée');
      
      // Actualiser les invitations
      if (farmId) {
        fetchTeamData(farmId);
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'invitation:', error);
      toast.error('Impossible d\'annuler l\'invitation');
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    // Pour l'instant, cette fonction simule simplement un renvoi
    toast.info("Fonctionnalité de renvoi en cours de développement");
  };
  
  return (
    <SettingsSection 
      title="Gestion des accès" 
      description="Gérez les accès des utilisateurs à votre ferme"
    >
      <div className="space-y-6">
        {farmIdLoading ? (
          <div className="flex items-center justify-center h-12 w-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : !farmId ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Vous devez configurer votre ferme avant de pouvoir gérer les accès utilisateurs.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Section des membres de l'équipe */}
            <TeamMembersList 
              loading={loading}
              teamMembers={teamMembers}
              onInviteClick={() => setInviteDialogOpen(true)} 
            />
            
            {/* Section des invitations en attente */}
            {invitations.length > 0 && (
              <PendingInvitationsList 
                invitations={invitations}
                onCancel={handleCancelInvitation}
                onResend={handleResendInvitation}
              />
            )}

            {/* Dialog pour inviter un utilisateur */}
            <InviteUserDialog 
              open={inviteDialogOpen} 
              onOpenChange={setInviteDialogOpen} 
            />
          </>
        )}
        
        {/* Description des rôles */}
        <RoleDescriptions />
      </div>
    </SettingsSection>
  );
}
