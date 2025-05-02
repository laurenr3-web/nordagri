
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InviteUserDialog } from '@/components/settings/users/InviteUserDialog';

export function UserInvitationSection() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inviter des utilisateurs</CardTitle>
        <CardDescription>
          Gérez l'accès à votre ferme en invitant vos collaborateurs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            Invitez vos collaborateurs à rejoindre votre ferme en leur envoyant une invitation par email.
            Vous pourrez définir leur niveau d'accès et leurs permissions.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Inviter un utilisateur
            </Button>
          </div>
        </div>
        
        <InviteUserDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />
      </CardContent>
    </Card>
  );
}
