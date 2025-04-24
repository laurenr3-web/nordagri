
import React, { useState } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save, Loader2 } from 'lucide-react';

interface ProfileSectionProps {
  firstName: string;
  lastName: string;
  email: string;
  loading: boolean;
  onUpdateProfile: (firstName: string, lastName: string) => Promise<boolean>;
}

export function ProfileSection({ 
  firstName, 
  lastName, 
  email, 
  loading, 
  onUpdateProfile 
}: ProfileSectionProps) {
  const [localFirstName, setLocalFirstName] = useState(firstName);
  const [localLastName, setLocalLastName] = useState(lastName);
  const [localEmail, setLocalEmail] = useState(email);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onUpdateProfile(localFirstName, localLastName);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = localFirstName !== firstName || 
                     localLastName !== lastName || 
                     localEmail !== email;

  return (
    <SettingsSection 
      title="Profil utilisateur" 
      description="Mettez à jour vos informations personnelles"
      icon={<User className="h-5 w-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">Prénom</Label>
            <Input
              id="first-name"
              value={localFirstName}
              onChange={(e) => setLocalFirstName(e.target.value)}
              disabled={loading || isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last-name">Nom</Label>
            <Input
              id="last-name"
              value={localLastName}
              onChange={(e) => setLocalLastName(e.target.value)}
              disabled={loading || isSubmitting}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            disabled={true}
            type="email"
          />
          <p className="text-xs text-muted-foreground">
            L'email est utilisé pour la connexion et ne peut pas être modifié dans cette version
          </p>
        </div>
        
        <Button 
          type="submit" 
          disabled={!hasChanges || loading || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mise à jour...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </form>
    </SettingsSection>
  );
}
