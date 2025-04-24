import React, { useState, useEffect } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { User, UserPlus, UserCheck, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TeamMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
}

/**
 * Composant pour afficher et gérer les accès utilisateurs et techniciens
 */
export function UserAccessSection() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  // État du formulaire d'invitation
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('technician');
  const [inviteLoading, setInviteLoading] = useState(false);

  // Charger les membres de l'équipe
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true);
      try {
        // Instead of using profiles, we'll get team members from the team_members table
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name, email, role, created_at')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform the data to match the TeamMember interface
        const formattedMembers: TeamMember[] = (data || []).map(member => ({
          id: member.id,
          email: member.email || '',
          first_name: member.name.split(' ')[0] || '',
          last_name: member.name.split(' ')[1] || '',
          role: member.role,
          status: 'active', // Default status for team members
          created_at: member.created_at
        }));
        
        setTeamMembers(formattedMembers);
      } catch (error) {
        console.error('Erreur lors du chargement des membres de l\'équipe:', error);
        toast.error('Impossible de charger les membres de l\'équipe');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);
  
  const handleInviteMember = async () => {
    if (!inviteEmail) {
      toast.error("L'adresse email est requise");
      return;
    }
    
    setInviteLoading(true);
    try {
      // Cette fonction serait implémentée dans un edge function Supabase
      const { error } = await supabase.functions.invoke('invite-user', {
        body: { email: inviteEmail, role: inviteRole }
      });
      
      if (error) throw error;
      
      toast.success(`Invitation envoyée à ${inviteEmail}`);
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('technician');
      
      // Actualiser la liste des membres après l'invitation
      // Dans une implémentation réelle, ce membre n'apparaitrait qu'après avoir accepté l'invitation
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', error);
      toast.error('Impossible d\'envoyer l\'invitation');
    } finally {
      setInviteLoading(false);
    }
  };
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'manager': return 'bg-blue-500';
      case 'technician': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getFormattedRole = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Gestionnaire';
      case 'technician': return 'Technicien';
      default: return role;
    }
  };
  
  return (
    <SettingsSection 
      title="Gestion des accès" 
      description="Gérez les accès des techniciens et des utilisateurs"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Membres de l'équipe</h3>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Inviter un membre
              </Button>
            </DialogTrigger>
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
                      <SelectItem value="technician">Technicien</SelectItem>
                      <SelectItem value="manager">Gestionnaire</SelectItem>
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
                  <TableHead>Statut</TableHead>
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
                          <div className="font-medium">
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {getFormattedRole(member.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeColor(member.status)}>
                        {member.status === 'active' ? 'Actif' : member.status === 'pending' ? 'En attente' : 'Inactif'}
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
        
        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Administrateur :</strong> Accès complet à toutes les fonctionnalités et paramétrages
          </p>
          <p>
            <strong>Gestionnaire :</strong> Peut gérer les équipements et les tâches, mais pas les paramètres avancés
          </p>
          <p>
            <strong>Technicien :</strong> Peut consulter et exécuter les tâches assignées
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
