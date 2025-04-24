
import React, { useState } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, User } from 'lucide-react';

interface ProfileSectionProps {
  firstName: string;
  lastName: string;
  email: string;
  loading: boolean;
  onUpdateProfile: (firstName: string, lastName: string) => Promise<boolean>;
}

export function ProfileSection({ firstName, lastName, email, loading, onUpdateProfile }: ProfileSectionProps) {
  const [editedFirstName, setEditedFirstName] = useState(firstName);
  const [editedLastName, setEditedLastName] = useState(lastName);
  const [isSaving, setIsSaving] = useState(false);
  
  // Mettre à jour les valeurs des états lorsque les props changent
  React.useEffect(() => {
    setEditedFirstName(firstName);
    setEditedLastName(lastName);
  }, [firstName, lastName]);
  
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfile(editedFirstName, editedLastName);
    } finally {
      setIsSaving(false);
    }
  };
  
  const hasChanges = editedFirstName !== firstName || editedLastName !== lastName;
  
  return (
    <SettingsSection
      title="Profil"
      description="Gérez vos informations personnelles"
    >
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-secondary-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium">
                {firstName ? `${firstName} ${lastName}` : 'Utilisateur'}
              </h3>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input 
                  id="firstName" 
                  value={editedFirstName} 
                  onChange={(e) => setEditedFirstName(e.target.value)} 
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input 
                  id="lastName" 
                  value={editedLastName} 
                  onChange={(e) => setEditedLastName(e.target.value)} 
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled />
              <p className="text-xs text-muted-foreground">
                Votre email est lié à votre compte et ne peut pas être modifié ici
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveProfile} 
              disabled={loading || isSaving || !hasChanges}
            >
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les modifications
            </Button>
          </div>
        </CardContent>
      </Card>
    </SettingsSection>
  );
}
