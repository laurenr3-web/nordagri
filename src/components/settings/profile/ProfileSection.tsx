
import React, { useState, useEffect } from 'react';
import { SettingsSectionWrapper } from '../SettingsSectionWrapper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileSectionProps {
  firstName: string;
  lastName: string;
  email: string;
  loading: boolean;
  onUpdateProfile: (firstName: string, lastName: string) => Promise<boolean>;
  onFieldChange?: () => void;
}

export function ProfileSection({ 
  firstName, 
  lastName, 
  email, 
  loading, 
  onUpdateProfile,
  onFieldChange 
}: ProfileSectionProps) {
  const [localFirstName, setLocalFirstName] = useState(firstName);
  const [localLastName, setLocalLastName] = useState(lastName);
  
  useEffect(() => {
    setLocalFirstName(firstName);
    setLocalLastName(lastName);
  }, [firstName, lastName]);

  const hasChanges = localFirstName !== firstName || localLastName !== lastName;

  const handleFieldChange = () => {
    if (onFieldChange) onFieldChange();
  };

  const handleSave = async () => {
    await onUpdateProfile(localFirstName, localLastName);
  };

  const getInitials = () => {
    const first = localFirstName.charAt(0).toUpperCase();
    const last = localLastName.charAt(0).toUpperCase();
    return first + last || 'U';
  };

  return (
    <SettingsSectionWrapper 
      title="Profil utilisateur" 
      description="Gérez vos informations personnelles"
      icon={<User className="h-5 w-5 text-primary" />}
      onSave={handleSave}
      hasChanges={hasChanges}
    >
      <div className="space-y-6">
        {/* Avatar section */}
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${localFirstName} ${localLastName}`} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">Photo de profil</p>
            <p className="text-xs text-muted-foreground mt-1">
              Les initiales sont générées automatiquement
            </p>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">Prénom</Label>
            <Input
              id="first-name"
              value={localFirstName}
              onChange={(e) => {
                setLocalFirstName(e.target.value);
                handleFieldChange();
              }}
              disabled={loading}
              placeholder="Votre prénom"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last-name">Nom</Label>
            <Input
              id="last-name"
              value={localLastName}
              onChange={(e) => {
                setLocalLastName(e.target.value);
                handleFieldChange();
              }}
              disabled={loading}
              placeholder="Votre nom"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Adresse email</Label>
          <div className="relative">
            <Input
              id="email"
              value={email}
              disabled={true}
              type="email"
              className="pr-20"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Non modifiable
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            L'email est utilisé pour la connexion et ne peut pas être modifié
          </p>
        </div>
      </div>
    </SettingsSectionWrapper>
  );
}
