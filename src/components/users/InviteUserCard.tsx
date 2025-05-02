
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { InviteUserForm } from './InviteUserForm';

export function InviteUserCard() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          <span>Inviter des utilisateurs</span>
        </CardTitle>
        <CardDescription>
          Invitez des collaborateurs à rejoindre votre ferme
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isFormVisible ? (
          <InviteUserForm 
            onSuccess={() => setIsFormVisible(false)} 
            onClose={() => setIsFormVisible(false)} 
          />
        ) : (
          <div className="text-center p-6">
            <p className="text-muted-foreground mb-4">
              Les membres invités recevront un email avec un lien pour rejoindre votre ferme.
              Vous pouvez définir leurs permissions maintenant ou les modifier plus tard.
            </p>
            <Button onClick={() => setIsFormVisible(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Inviter un utilisateur
            </Button>
          </div>
        )}
      </CardContent>
      
      {!isFormVisible && (
        <CardFooter className="justify-between border-t px-6 py-4">
          <div className="text-xs text-muted-foreground">
            Seuls les utilisateurs avec un rôle d'administrateur peuvent inviter d'autres utilisateurs
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
