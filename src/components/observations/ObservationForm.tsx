
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useEquipmentOptions } from '@/hooks/equipment/useEquipmentOptions';
import { useFieldObservations } from '@/hooks/observations/useFieldObservations';
import { ObservationType, UrgencyLevel, FieldObservationFormValues } from '@/types/FieldObservation';
import { toast } from 'sonner';
import { Camera, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const ObservationForm = () => {
  const { createObservation } = useFieldObservations();
  const { data: equipments = [], isLoading: isLoadingEquipment } = useEquipmentOptions();
  
  const [selectedEquipment, setSelectedEquipment] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<FieldObservationFormValues>>({
    photos: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<{file: File; preview: string}[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    
    const newImages: {file: File; preview: string}[] = [];
    const uploadedPhotoIds: string[] = [...(formData.photos || [])];
    
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      if (!file.type.startsWith('image/')) continue;
      
      // Générer un prévisualisation
      const preview = URL.createObjectURL(file);
      newImages.push({ file, preview });
      
      // Générer un ID unique pour le fichier
      const fileId = `${uuidv4()}.${file.name.split('.').pop()}`;
      
      try {
        // Upload vers Supabase Storage
        const { error } = await supabase.storage
          .from('field-observations')
          .upload(fileId, file);
          
        if (error) throw error;
        
        // Ajouter l'ID du fichier à la liste
        uploadedPhotoIds.push(fileId);
      } catch (error) {
        console.error("Erreur lors de l'upload:", error);
        toast.error("Erreur lors de l'upload de l'image");
      }
    }
    
    setPreviewImages([...previewImages, ...newImages]);
    setFormData(prev => ({ ...prev, photos: uploadedPhotoIds }));
    setIsUploading(false);
  };

  const removeImage = async (index: number) => {
    if (!formData.photos) return;
    
    // Supprimer l'image du stockage
    try {
      const fileId = formData.photos[index];
      await supabase.storage.from('field-observations').remove([fileId]);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error);
    }
    
    // Supprimer la prévisualisation
    const newPreviewImages = [...previewImages];
    if (newPreviewImages[index]) {
      URL.revokeObjectURL(newPreviewImages[index].preview);
      newPreviewImages.splice(index, 1);
      setPreviewImages(newPreviewImages);
    }
    
    // Supprimer l'ID du fichier de la liste
    const newUploadedPhotoIds = [...(formData.photos || [])];
    newUploadedPhotoIds.splice(index, 1);
    setFormData(prev => ({ ...prev, photos: newUploadedPhotoIds }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment || !formData.observation_type || !formData.urgency_level) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const equipment = equipments.find(e => e.id === selectedEquipment);
    if (!equipment) return;

    try {
      const values: FieldObservationFormValues = {
        equipment_id: selectedEquipment,
        equipment: equipment.name,
        observation_type: formData.observation_type as ObservationType,
        urgency_level: formData.urgency_level as UrgencyLevel,
        photos: formData.photos || [],
        location: formData.location,
        description: formData.description
      };

      await createObservation.mutateAsync(values);
      
      // Nettoyer les URL des prévisualisations
      previewImages.forEach(img => URL.revokeObjectURL(img.preview));
      
      // Réinitialiser le formulaire
      setSelectedEquipment(null);
      setFormData({ photos: [] });
      setPreviewImages([]);
    } catch (error) {
      console.error("Erreur lors de la création de l'observation:", error);
      toast.error("Une erreur s'est produite lors de la création de l'observation");
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          onValueChange={(value) => setSelectedEquipment(Number(value))}
          disabled={isLoadingEquipment}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner l'équipement" />
          </SelectTrigger>
          <SelectContent>
            {equipments.map((equipment) => (
              <SelectItem key={equipment.id} value={equipment.id.toString()}>
                {equipment.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => 
            setFormData(prev => ({ ...prev, observation_type: value as ObservationType }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type d'observation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="panne">Panne</SelectItem>
            <SelectItem value="usure">Usure</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="autre">Autre</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => 
            setFormData(prev => ({ ...prev, urgency_level: value as UrgencyLevel }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Niveau d'urgence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="surveiller">À surveiller</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Localisation (optionnel)"
          onChange={(e) => 
            setFormData(prev => ({ ...prev, location: e.target.value }))}
        />

        <Textarea
          placeholder="Description détaillée (optionnel)"
          onChange={(e) => 
            setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
        
        {/* Photos upload section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Photos</label>
          
          <div className="flex flex-wrap gap-2">
            {previewImages.map((img, idx) => (
              <div key={idx} className="relative w-20 h-20">
                <img 
                  src={img.preview} 
                  className="w-20 h-20 object-cover rounded border"
                  alt={`Preview ${idx}`} 
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
            
            <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              <Camera className="h-6 w-6 text-gray-400" />
            </label>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={createObservation.isPending || isUploading}
        >
          {createObservation.isPending || isUploading ? 'Enregistrement...' : 'Enregistrer l\'observation'}
        </Button>
      </form>
    </Card>
  );
};
