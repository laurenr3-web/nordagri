
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';

interface TeamMemberProps {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  onEdit: () => void;
}

export const TeamMember = ({ name, role, email, phone, onEdit }: TeamMemberProps) => {
  return (
    <div className="p-3 flex justify-between items-center">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
        {(email || phone) && (
          <div className="flex gap-3 mt-1">
            {email && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Mail className="h-3 w-3 mr-1" />
                {email}
              </div>
            )}
            {phone && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Phone className="h-3 w-3 mr-1" />
                {phone}
              </div>
            )}
          </div>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onEdit}
      >
        Edit
      </Button>
    </div>
  );
};
