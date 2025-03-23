
import React, { useState } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { User } from 'lucide-react';
import { toast } from 'sonner';

export const ProfileSection = () => {
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState('John Doe');
  const [profileEmail, setProfileEmail] = useState('john.doe@example.com');

  // Handle profile update
  const handleProfileUpdate = () => {
    toast.success('Profile updated successfully');
    setProfileDialogOpen(false);
  };

  return (
    <SettingsSection 
      title="Profile & Account" 
      description="Manage your personal information and account settings"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-secondary-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium">{profileName}</h3>
          <p className="text-sm text-muted-foreground">{profileEmail}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setProfileDialogOpen(true)}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={profileName} 
                onChange={(e) => setProfileName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={profileEmail} 
                onChange={(e) => setProfileEmail(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleProfileUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  );
};
