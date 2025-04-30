
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, UserPlus, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TeamMember {
  id: string;
  user_id?: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
}

interface TeamMembersListProps {
  teamMembers: TeamMember[];
  loading: boolean;
  onInviteClick: () => void;
}

export function TeamMembersList({ teamMembers, loading, onInviteClick }: TeamMembersListProps) {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Membres de l'équipe</h3>
        <Button size="sm" onClick={onInviteClick}>
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
          <Button onClick={onInviteClick}>
            <UserPlus className="h-4 w-4 mr-2" />
            Inviter un membre
          </Button>
        </div>
      )}
    </div>
  );
}
