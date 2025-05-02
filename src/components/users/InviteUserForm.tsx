
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUserInvitation } from '@/hooks/useUserInvitation';

// Schéma de validation
const inviteUserSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  role: z.enum(['viewer', 'editor', 'admin'], {
    required_error: "Vous devez sélectionner un rôle",
  }),
});

type InviteUserFormData = z.infer<typeof inviteUserSchema>;

interface InviteUserFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function InviteUserForm({ onSuccess, onClose }: InviteUserFormProps) {
  const { inviteUser, isLoading } = useUserInvitation();
  
  const form = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: '',
      role: 'viewer',
    },
  });
  
  const onSubmit = async (data: InviteUserFormData) => {
    const success = await inviteUser({
      email: data.email,
      role: data.role,
    });
    
    if (success) {
      form.reset();
      if (onSuccess) onSuccess();
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="email@exemple.com" 
                  type="email" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Rôle</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="viewer" id="viewer" />
                    <Label htmlFor="viewer" className="flex flex-col">
                      <span>Lecteur</span>
                      <span className="text-xs text-muted-foreground">Peut consulter sans modifier</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="editor" id="editor" />
                    <Label htmlFor="editor" className="flex flex-col">
                      <span>Éditeur</span>
                      <span className="text-xs text-muted-foreground">Peut modifier mais pas administrer</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="flex flex-col">
                      <span>Administrateur</span>
                      <span className="text-xs text-muted-foreground">Tous les droits sauf la suppression</span>
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Envoi en cours..." : "Inviter l'utilisateur"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
