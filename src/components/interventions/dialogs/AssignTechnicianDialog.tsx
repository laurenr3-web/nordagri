
import React from 'react';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Users } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Intervention } from '@/types/Intervention';

// Schéma de validation pour le formulaire
const formSchema = z.object({
  technician: z.string().min(1, {
    message: "Veuillez sélectionner ou saisir un technicien",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Liste de techniciens fictive (à remplacer par des données réelles)
const DEMO_TECHNICIANS = [
  { id: '1', name: 'Jean Dupont' },
  { id: '2', name: 'Marie Martin' },
  { id: '3', name: 'Pierre Dubois' },
  { id: '4', name: 'Sophie Leroy' },
  { id: '5', name: 'Lucas Bernard' },
];

interface AssignTechnicianDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (technician: string) => void;
  intervention: Intervention | null;
  technicians?: { id: string; name: string }[];
}

const AssignTechnicianDialog: React.FC<AssignTechnicianDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  intervention,
  technicians = DEMO_TECHNICIANS,
}) => {
  // Form hooks
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      technician: intervention?.technician || '',
    },
  });

  // État pour suivre si l'utilisateur veut entrer un nom personnalisé
  const [useCustomName, setUseCustomName] = React.useState(false);

  // Soumettre le formulaire
  const handleSubmit = (values: FormValues) => {
    onSubmit(values.technician);
  };

  if (!intervention) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Assigner un technicien
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Intervention</h3>
              <p className="text-sm">{intervention.title}</p>
              <p className="text-sm text-muted-foreground">{intervention.equipment}</p>
            </div>
            
            {!useCustomName ? (
              <>
                <FormField
                  control={form.control}
                  name="technician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sélectionner un technicien</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un technicien" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.name}>
                              {tech.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="button"
                  variant="link"
                  className="px-0"
                  onClick={() => setUseCustomName(true)}
                >
                  Saisir un autre nom
                </Button>
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="technician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du technicien</FormLabel>
                      <FormControl>
                        <Input placeholder="Saisir le nom du technicien" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="button"
                  variant="link"
                  className="px-0"
                  onClick={() => setUseCustomName(false)}
                >
                  Choisir dans la liste
                </Button>
              </>
            )}
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Assigner</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTechnicianDialog;
