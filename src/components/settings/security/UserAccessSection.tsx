
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
      // Récupérer les membres de l'équipe
      const { data: membersData, error: membersError } = await supabase
        .from('farm_members')
        .select(`
          id,
          role,
          created_at,
          user_id,
          user:user_id (
            id,
            email
          )
        `)
        .eq('farm_id', farmId);
      
      if (membersError) throw membersError;
      
      // Récupérer les profils des utilisateurs pour avoir leurs noms
      // S'assurer d'avoir un tableau d'IDs valides
      const userIds = membersData
        ?.filter(member => member.user && typeof member.user === 'object')
        .map(member => (member.user as any)?.id)
        .filter(Boolean) || [];
      
      const { data: profilesData, error: profilesError } = userIds.length > 0 
        ? await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', userIds)
        : { data: [], error: null };
      
      if (profilesError) throw profilesError;
      
      // Récupérer les invitations en attente
      const { data: pendingInvites, error: invitesError } = await supabase
        .from('invitations')
        .select('*')
        .eq('farm_id', farmId)
        .neq('status', 'accepted');
      
      if (invitesError) throw invitesError;
      
      // Formater les données des membres avec vérification de type
      const formattedMembers = membersData?.map(member => {
        const user = member.user && typeof member.user === 'object' ? member.user : null;
        const profile = user ? profilesData?.find(p => p.id === (user as any).id) : null;
        
        return {
          id: member.id,
          user_id: user ? (user as any).id : '',
          email: user ? (user as any).email || '' : '',
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          role: member.role,
          status: 'active', // Tous les membres sont actifs par défaut
          created_at: member.created_at
        };
      }) || [];
      
      // Formater les invitations
      const formattedInvitations = pendingInvites?.map(invite => ({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        created_at: invite.created_at,
        expires_at: invite.expires_at
      })) || [];
      
      setTeamMembers(formattedMembers);
      setInvitations(formattedInvitations);
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
