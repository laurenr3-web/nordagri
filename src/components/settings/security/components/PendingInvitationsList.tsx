
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at?: string;
}

interface PendingInvitationsListProps {
  invitations: PendingInvitation[];
  onCancel: (id: string) => void;
  onResend: (id: string) => void;
}

export function PendingInvitationsList({ invitations, onCancel, onResend }: PendingInvitationsListProps) {
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
  const isInvitationExpired = (expirationDate?: string) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  return (
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
                            onClick={() => onResend(invitation.id)}
                          >
                            Renvoyer
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => onCancel(invitation.id)}
                          >
                            Annuler
                          </Button>
                        </>
                      )}
                      {(status === 'cancelled' || expired) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onResend(invitation.id)}
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
  );
}
