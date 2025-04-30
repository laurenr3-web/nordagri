
import React, { useState } from 'react';
import { DialogWrapper } from '@/components/ui/dialog-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserInvitation } from '@/hooks/useUserInvitation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const inviteUserSchema = z.object({
  email: z.string().email("L'email n'est pas valide"),
  role: z.enum(['viewer', 'editor', 'admin'])
});

type InviteUserFormData = z.infer<typeof inviteUserSchema>;

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteUserDialog({ open, onOpenChange }: InviteUserDialogProps) {
  const { inviteUser, isLoading } = useUserInvitation();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      role: 'viewer'
    }
  });

  const onSubmit = async (data: InviteUserFormData) => {
    const success = await inviteUser({
      email: data.email,
      role: data.role
    });
    if (success) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <DialogWrapper
      title="Inviter un utilisateur"
      description="Envoyer une invitation à un nouvel utilisateur pour rejoindre votre ferme"
      open={open}
      onOpenChange={onOpenChange}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="email@exemple.com"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rôle</Label>
          <Select 
            onValueChange={(value: 'viewer' | 'editor' | 'admin') => setValue('role', value)}
            defaultValue="viewer"
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Lecteur</SelectItem>
              <SelectItem value="editor">Éditeur</SelectItem>
              <SelectItem value="admin">Administrateur</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Invitation en cours...' : 'Inviter'}
          </Button>
        </div>
      </form>
    </DialogWrapper>
  );
}
