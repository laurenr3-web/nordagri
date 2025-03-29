
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Part } from '@/types/Part';
import { toast } from 'sonner';

interface AddPartFormProps {
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  categories?: string[];
  editPart?: Part | null;
}

export const AddPartForm: React.FC<AddPartFormProps> = ({ 
  onSuccess, 
  onCancel,
  categories = ['Motor', 'Electrical', 'Hydraulic', 'Mechanical', 'Transmission', 'Other'], 
  editPart = null 
}) => {
  // État du formulaire
  const [formData, setFormData] = useState<Partial<Part>>(
    editPart ? 
    { ...editPart } : 
    {
      name: '',
      partNumber: '',
      category: '',
      manufacturer: '',
      price: 0,
      stock: 0,
      reorderPoint: 5,
      location: '',
      description: '',
      compatibility: [],
      image: 'https://via.placeholder.com/200?text=Part',
    }
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [compatibilityInput, setCompatibilityInput] = useState('');
  
  // Gestion des changements de champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Effacer l'erreur quand l'utilisateur corrige le champ
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Gestion des changements de valeurs numériques
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseFloat(value);
    
    setFormData({
      ...formData,
      [name]: numValue
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Gestion des changements de catégorie
  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category: value
    });
    
    if (errors.category) {
      setErrors({
        ...errors,
        category: ''
      });
    }
  };
  
  // Gestion de l'ajout d'équipements compatibles
  const handleAddCompatibility = () => {
    if (compatibilityInput.trim() !== '') {
      setFormData({
        ...formData,
        compatibility: [...(formData.compatibility || []), compatibilityInput.trim()]
      });
      setCompatibilityInput('');
    }
  };
  
  // Supprimer un élément de compatibilité
  const handleRemoveCompatibility = (index: number) => {
    const newCompatibility = [...(formData.compatibility || [])];
    newCompatibility.splice(index, 1);
    setFormData({
      ...formData,
      compatibility: newCompatibility
    });
  };
  
  // Validation du formulaire
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name) newErrors.name = 'Le nom est obligatoire';
    if (!formData.partNumber) newErrors.partNumber = 'Le numéro de pièce est obligatoire';
    if (!formData.category) newErrors.category = 'La catégorie est obligatoire';
    if (formData.price === undefined || formData.price < 0) newErrors.price = 'Le prix doit être un nombre positif';
    if (formData.stock === undefined || formData.stock < 0) newErrors.stock = 'Le stock doit être un nombre positif';
    if (formData.reorderPoint === undefined || formData.reorderPoint < 0) newErrors.reorderPoint = 'Le seuil de réapprovisionnement doit être un nombre positif';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Formulaire incomplet", {
        description: "Veuillez corriger les erreurs avant de soumettre le formulaire"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Si nous avons une fonction de réussite, l'appeler avec les données
      if (onSuccess) {
        // Si c'est une édition, préserver l'ID
        const submitData = editPart ? { ...formData, id: editPart.id } : formData;
        onSuccess(submitData);
      }
      
      // Réinitialiser le formulaire
      if (!editPart) {
        setFormData({
          name: '',
          partNumber: '',
          category: '',
          manufacturer: '',
          price: 0,
          stock: 0,
          reorderPoint: 5,
          location: '',
          description: '',
          compatibility: [],
          image: 'https://via.placeholder.com/200?text=Part',
        });
      }
      
      // Afficher un toast de confirmation
      toast.success(editPart ? "Pièce mise à jour" : "Pièce ajoutée", {
        description: editPart 
          ? `${formData.name} a été mise à jour avec succès` 
          : `${formData.name} a été ajoutée à l'inventaire`
      });
      
      // Fermer le formulaire si une fonction d'annulation est fournie
      if (onCancel && !editPart) {
        onCancel();
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast.error("Erreur lors de la soumission", {
        description: "Une erreur s'est produite lors de la soumission du formulaire"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Champ Nom */}
        <div className="space-y-2">
          <Label htmlFor="name" className={errors.name ? 'text-destructive' : ''}>
            Nom <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="Nom de la pièce"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        
        {/* Champ Numéro de pièce */}
        <div className="space-y-2">
          <Label htmlFor="partNumber" className={errors.partNumber ? 'text-destructive' : ''}>
            Numéro de pièce <span className="text-destructive">*</span>
          </Label>
          <Input
            id="partNumber"
            name="partNumber"
            value={formData.partNumber || ''}
            onChange={handleChange}
            placeholder="Référence (ex: ABC-123)"
            className={errors.partNumber ? 'border-destructive' : ''}
          />
          {errors.partNumber && <p className="text-xs text-destructive">{errors.partNumber}</p>}
        </div>
        
        {/* Champ Catégorie */}
        <div className="space-y-2">
          <Label htmlFor="category" className={errors.category ? 'text-destructive' : ''}>
            Catégorie <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.category || ''}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger id="category" className={errors.category ? 'border-destructive' : ''}>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
        </div>
        
        {/* Champ Fabricant */}
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Fabricant</Label>
          <Input
            id="manufacturer"
            name="manufacturer"
            value={formData.manufacturer || ''}
            onChange={handleChange}
            placeholder="Nom du fabricant"
          />
        </div>
        
        {/* Champ Prix */}
        <div className="space-y-2">
          <Label htmlFor="price" className={errors.price ? 'text-destructive' : ''}>
            Prix <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price || 0}
            onChange={handleNumberChange}
            placeholder="0.00"
            className={errors.price ? 'border-destructive' : ''}
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
        </div>
        
        {/* Champ Stock */}
        <div className="space-y-2">
          <Label htmlFor="stock" className={errors.stock ? 'text-destructive' : ''}>
            Stock actuel <span className="text-destructive">*</span>
          </Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={formData.stock || 0}
            onChange={handleNumberChange}
            placeholder="0"
            className={errors.stock ? 'border-destructive' : ''}
          />
          {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
        </div>
        
        {/* Champ Seuil de réapprovisionnement */}
        <div className="space-y-2">
          <Label htmlFor="reorderPoint" className={errors.reorderPoint ? 'text-destructive' : ''}>
            Seuil de réapprovisionnement
          </Label>
          <Input
            id="reorderPoint"
            name="reorderPoint"
            type="number"
            min="0"
            value={formData.reorderPoint || 5}
            onChange={handleNumberChange}
            placeholder="5"
            className={errors.reorderPoint ? 'border-destructive' : ''}
          />
          {errors.reorderPoint && <p className="text-xs text-destructive">{errors.reorderPoint}</p>}
        </div>
        
        {/* Champ Emplacement */}
        <div className="space-y-2">
          <Label htmlFor="location">Emplacement</Label>
          <Input
            id="location"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            placeholder="Emplacement dans l'entrepôt"
          />
        </div>
      </div>
      
      {/* Champ Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Description détaillée de la pièce"
          className="min-h-[100px]"
        />
      </div>
      
      {/* Champ URL de l'image */}
      <div className="space-y-2">
        <Label htmlFor="image">URL de l'image</Label>
        <Input
          id="image"
          name="image"
          value={formData.image || ''}
          onChange={handleChange}
          placeholder="https://exemple.com/image.jpg"
        />
        {formData.image && (
          <div className="mt-2 h-20 w-20 rounded overflow-hidden">
            <img 
              src={formData.image} 
              alt="Aperçu" 
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Error';
              }}
            />
          </div>
        )}
      </div>
      
      {/* Compatibilité */}
      <div className="space-y-2">
        <Label>Compatibilité avec équipements</Label>
        <div className="flex gap-2">
          <Input
            value={compatibilityInput}
            onChange={(e) => setCompatibilityInput(e.target.value)}
            placeholder="Ajouter un équipement compatible"
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={handleAddCompatibility}
            variant="outline"
          >
            Ajouter
          </Button>
        </div>
        
        {/* Liste des compatibilités */}
        {formData.compatibility && formData.compatibility.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.compatibility.map((item, index) => (
              <div key={index} className="flex items-center bg-secondary rounded-md px-2 py-1">
                <span className="text-sm">{item}</span>
                <button 
                  type="button"
                  className="ml-2 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveCompatibility(index)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Boutons d'action */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enregistrement...' : editPart ? 'Mettre à jour' : 'Ajouter la pièce'}
        </Button>
      </div>
    </form>
  );
};

export default AddPartForm;
