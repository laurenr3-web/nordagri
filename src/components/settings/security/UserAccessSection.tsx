
import React, { useState, useEffect } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { User, UserPlus, UserCheck, Clock, AlertTriangle, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useFarmId } from '@/hooks/useFarmId';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TeamMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

/**
 * Composant pour afficher et gérer les accès utilisateurs et techniciens
 */
export function UserAccessSection() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  // État du formulaire d'invitation
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviteLoading, setInviteLoading] = useState(false);
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
          user:user_id (
            id,
            email
          )
        `)
        .eq('farm_id', farmId);
      
      if (membersError) throw membersError;
      
      // Récupérer les profils des utilisateurs pour avoir leurs noms
      const userIds = membersData?.map(member => member.user?.id).filter(Boolean) || [];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Récupérer les invitations en attente
      const { data: pendingInvites, error: invitesError } = await supabase
        .from('invitations')
        .select('*')
        .eq('farm_id', farmId)
        .neq('status', 'accepted');
      
      if (invitesError) throw invitesError;
      
      // Formater les données des membres
      const formattedMembers = membersData?.map(member => {
        const profile = profilesData?.find(p => p.id === member.user?.id);
        
        return {
          id: member.id,
          user_id: member.user?.id,
          email: member.user?.email || '',
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

  const handleInviteMember = async () => {
    if (!inviteEmail) {
      toast.error("L'adresse email est requise");
      return;
    }
    
    if (!farmId) {
      toast.error("ID de ferme non disponible");
      return;
    }
    
    setInviteLoading(true);
    try {
      const { error } = await supabase.functions.invoke('invite-user', {
        body: { 
          email: inviteEmail, 
          role: inviteRole,
          farmId: farmId
        }
      });
      
      if (error) throw error;
      
      toast.success(`Invitation envoyée à ${inviteEmail}`);
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('viewer');
      
      // Actualiser la liste des membres et invitations
      fetchTeamData(farmId);
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', error);
      toast.error(error.message || 'Impossible d\'envoyer l\'invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    // Pour l'instant, cette fonction simule simplement un renvoi
    // À terme, on pourrait implémenter une fonction pour recréer une invitation ou prolonger la date d'expiration
    toast.info("Fonctionnalité de renvoi en cours de développement");
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
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-red-500';
      case 'admin': return 'bg-blue-500';
      case 'editor': return 'bg-green-500';
      case 'viewer': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getFormattedRole = (role: string) => {
    switch (role) {
      case 'owner': return 'Propriétaire';
      case 'admin': return 'Administrateur';
      case 'editor': return 'Éditeur';
      case 'viewer': return 'Lecteur';
      default: return role;
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Vérifier si la date d'expiration est dépassée
  const isInvitationExpired = (expirationDate: string) => {
    return new Date(expirationDate) < new Date();
  };
  
  return (
    <SettingsSection 
      title="Gestion des accès" 
      description="Gérez les accès des utilisateurs à votre ferme"
    >
      <div className="space-y-6">
        {farmIdLoading ? (
          <Skeleton className="h-12 w-full" />
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
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Membres de l'équipe</h3>
                <Button size="sm" onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Inviter un membre
                </Button>
              </div>
              
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : teamMembers.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead className="text-right">Ajouté le</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="bg-muted rounded-full h-8 w-8 flex items-center justify-center">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                {member.first_name || member.last_name ? (
                                  <div className="font-medium">
                                    {member.first_name} {member.last_name}
                                  </div>
                                ) : null}
                                <div className="text-sm text-muted-foreground">{member.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(member.role)}>
                              {getFormattedRole(member.role)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground text-sm">
                                {new Date(member.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium">Aucun membre d'équipe</h3>
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore ajouté de membres à votre équipe.
                  </p>
                  <Button onClick={() => setInviteDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Inviter un membre
                  </Button>
                </div>
              )}
            </div>
            
            {/* Section des invitations en attente */}
            {invitations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Invitations en attente</h3>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((invitation) => {
                        const expired = isInvitationExpired(invitation.expires_at);
                        const status = expired ? 'expired' : invitation.status;
                        
                        return (
                          <TableRow key={invitation.id}>
                            <TableCell>{invitation.email}</TableCell>
                            <TableCell>
                              <Badge className={getRoleBadgeColor(invitation.role)}>
                                {getFormattedRole(invitation.role)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusBadgeColor(status)}>
                                {status === 'pending' ? 'En attente' : 
                                 status === 'cancelled' ? 'Annulée' : 
                                 status === 'expired' ? 'Expirée' : status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                {status === 'pending' && !expired && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleResendInvitation(invitation.id)}
                                    >
                                      Renvoyer
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() => handleCancelInvitation(invitation.id)}
                                    >
                                      Annuler
                                    </Button>
                                  </>
                                )}
                                {(status === 'cancelled' || expired) && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleResendInvitation(invitation.id)}
                                  >
                                    Réinviter
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Dialogue d'invitation */}
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Inviter un nouveau membre</DialogTitle>
                  <DialogDescription>
                    Envoyez une invitation par email pour ajouter un nouveau membre à votre équipe.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Adresse email</Label>
                    <Input
                      id="email"
                      placeholder="nom@exemple.fr"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={inviteLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole} disabled={inviteLoading}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Sélectionnez un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Lecteur</SelectItem>
                        <SelectItem value="editor">Éditeur</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)} disabled={inviteLoading}>
                    Annuler
                  </Button>
                  <Button onClick={handleInviteMember} disabled={inviteLoading || !inviteEmail}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Envoyer l'invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
        
        {/* Description des rôles */}
        <div className="text-sm text-muted-foreground pt-6 border-t mt-6">
          <h4 className="font-medium text-foreground mb-2">Description des rôles</h4>
          <p>
            <strong>Propriétaire :</strong> Créateur de la ferme, accès complet à toutes les fonctionnalités
          </p>
          <p>
            <strong>Administrateur :</strong> Peut gérer les utilisateurs et accéder à tous les paramètres
          </p>
          <p>
            <strong>Éditeur :</strong> Peut gérer les équipements, les tâches et les données
          </p>
          <p>
            <strong>Lecteur :</strong> Peut consulter les données sans pouvoir les modifier
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
