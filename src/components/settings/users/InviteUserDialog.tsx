
import React from 'react';
import { DialogWrapper } from '@/components/ui/dialog-wrapper';
import { InviteUserForm } from '@/components/users/InviteUserForm';

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteUserDialog({ open, onOpenChange }: InviteUserDialogProps) {
  return (
    <DialogWrapper
      title="Inviter un utilisateur"
      description="Envoyer une invitation à un nouvel utilisateur pour rejoindre votre ferme"
      open={open}
      onOpenChange={onOpenChange}
    >
      <InviteUserForm onSuccess={() => onOpenChange(false)} onClose={() => onOpenChange(false)} />
    </DialogWrapper>
  );
}
