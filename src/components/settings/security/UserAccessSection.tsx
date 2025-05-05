
import React, { useState } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFarmId } from '@/hooks/useFarmId';
import { TeamMembersList } from './components/TeamMembersList';
import { PendingInvitationsList } from './components/PendingInvitationsList';
import { RoleDescriptions } from './components/RoleDescriptions';
import { InviteUserDialog } from '../users/InviteUserDialog';
import { toast } from 'sonner';
import { useTeamMembers } from '@/hooks/useTeamMembers';

/**
 * Composant pour afficher et gérer les accès utilisateurs et techniciens
 */
export function UserAccessSection() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { farmId, isLoading: farmIdLoading } = useFarmId();
  const { 
    teamMembers, 
    invitations, 
    loading, 
    handleCancelInvitation,
    handleResendInvitation
  } = useTeamMembers();

  const onCancelInvitation = async (invitationId: string) => {
    try {
      await handleCancelInvitation(invitationId);
      toast.success('Invitation annulée');
    } catch (error) {
      toast.error('Impossible d\'annuler l\'invitation');
    }
  };

  const onResendInvitation = async (invitationId: string) => {
    try {
      await handleResendInvitation(invitationId);
      toast.info("Fonctionnalité de renvoi en cours de développement");
    } catch (error) {
      toast.error('Erreur lors du renvoi de l\'invitation');
    }
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
                onCancel={onCancelInvitation}
                onResend={onResendInvitation}
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
