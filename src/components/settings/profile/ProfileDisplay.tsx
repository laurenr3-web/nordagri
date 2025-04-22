
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface ProfileDisplayProps {
  loading: boolean;
  name: string;
  email: string;
  onEdit: () => void;
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ loading, name, email, onEdit }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
      <User className="h-8 w-8 text-secondary-foreground" />
    </div>
    <div className="space-y-1">
      <h3 className="font-medium">{loading ? 'Loading...' : name}</h3>
      <p className="text-sm text-muted-foreground">{email}</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2"
        onClick={onEdit}
        disabled={loading}
      >
        Edit Profile
      </Button>
    </div>
  </div>
);

export default ProfileDisplay;
