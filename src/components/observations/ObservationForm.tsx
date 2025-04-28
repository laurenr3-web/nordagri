
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X } from 'lucide-react';
import { FieldObservationFormValues, ObservationType, UrgencyLevel } from '@/types/FieldObservation';
import { useEquipmentOptions } from '@/hooks/equipment/useEquipmentOptions';
import { useFieldObservations } from '@/hooks/observations/useFieldObservations';

const observationTypes: { value: ObservationType; label: string }[] = [
  { value: 'panne', label: 'Panne' },
  { value: 'usure', label: 'Usure' },
  { value: 'anomalie', label: 'Anomalie' },
  { value: 'entretien', label: 'Entretien nécessaire' },
  { value: 'autre', label: 'Autre' },
];

const urgencyLevels: { value: UrgencyLevel; label: string; color: string }[] = [
  { value: 'normal', label: 'Normal', color: 'bg-green-100 text-green-800' },
  { value: 'surveiller', label: 'À surveiller', color: 'bg-amber-100 text-amber-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

interface ObservationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FieldObservationFormValues) => Promise<void>;
}

const observationSchema = z.object({
  equipment_id: z.number({
    required_error: "Veuillez sélectionner un équipement"
  }),
  equipment: z.string().min(1, { message: "Le nom de l'équipement est requis" }),
  observation_type: z.string() as z.ZodType<ObservationType>,
  urgency_level: z.string() as z.ZodType<UrgencyLevel>,
  description: z.string().min(3, { message: "Une description est requise" }),
  location: z.string().optional(),
});

export const ObservationForm: React.FC<ObservationFormProps> = ({ open, onOpenChange, onSubmit }) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { data: equipments = [], isLoading: isLoadingEquipments } = useEquipmentOptions();
  const { uploadPhotos } = useFieldObservations();

  const form = useForm<z.infer<typeof observationSchema>>({
    resolver: zodResolver(observationSchema),
    defaultValues: {
      equipment_id: 0,
      equipment: '',
      observation_type: 'anomalie',
      urgency_level: 'normal',
      description: '',
      location: '',
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      // Créer des URLs temporaires pour l'aperçu
      const newPhotoUrls = files.map(file => URL.createObjectURL(file));
      setPhotos(prevPhotos => [...prevPhotos, ...files]);
      setPhotoUrls(prevUrls => [...prevUrls, ...newPhotoUrls]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
    URL.revokeObjectURL(photoUrls[index]); // Libérer l'URL
    setPhotoUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (values: z.infer<typeof observationSchema>) => {
    try {
      setIsUploading(true);
      
      // Uploader les photos si nécessaire
      let uploadedPhotoUrls: string[] = [];
      if (photos.length > 0) {
        uploadedPhotoUrls = await uploadPhotos(photos);
      }
      
      // Soumettre le formulaire avec les URLs des photos
      await onSubmit({
        ...values,
        photos: uploadedPhotoUrls,
      });
      
      // Réinitialiser le formulaire
      form.reset();
      setPhotos([]);
      setPhotoUrls([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting observation:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEquipmentChange = (value: string) => {
    const selectedEquipment = equipments.find(eq => eq.id.toString() === value);
    if (selectedEquipment) {
      form.setValue('equipment_id', selectedEquipment.id);
      form.setValue('equipment', selectedEquipment.name);
    }
  };

  const isSubmitting = form.formState.isSubmitting || isUploading;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isSubmitting) {
        if (!isOpen) {
          form.reset();
          setPhotos([]);
          setPhotoUrls([]);
        }
        onOpenChange(isOpen);
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouvelle observation terrain</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="equipment_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Équipement</FormLabel>
                    <Select
                      disabled={isLoadingEquipments}
                      onValueChange={(value) => handleEquipmentChange(value)}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un équipement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {equipments.map((equipment) => (
                          <SelectItem key={equipment.id} value={equipment.id.toString()}>
                            {equipment.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observation_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'observation</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {observationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgency_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau d'urgence</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {urgencyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className={`px-2 py-1 rounded-md ${level.color}`}>
                              {level.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localisation (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Parcelle nord" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez ce que vous avez observé..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Photos (optionnel)</FormLabel>
              <div className="flex flex-wrap gap-2">
                {photoUrls.map((url, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img 
                      src={url} 
                      className="w-full h-full object-cover rounded-md border"
                      alt={`Aperçu ${index + 1}`}
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                      onClick={() => removePhoto(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <div className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer relative overflow-hidden">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload size={24} className="text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Ajoutez des photos pour illustrer votre observation
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer l'observation"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
