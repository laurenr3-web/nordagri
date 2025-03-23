
import React from 'react';
import { Button } from '@/components/ui/button';

interface TeamMemberProps {
  name: string;
  role: string;
  onEdit: () => void;
}

export const TeamMember = ({ name, role, onEdit }: TeamMemberProps) => {
  return (
    <div className="p-3 flex justify-between items-center">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
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
