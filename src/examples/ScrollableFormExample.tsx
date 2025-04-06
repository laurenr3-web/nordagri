import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ScrollableDialog,
  ScrollableDialogContent,
  ScrollableDialogHeader,
  ScrollableDialogTitle,
  ScrollableDialogDescription,
  ScrollableDialogFooter,
  ScrollableDialogTrigger,
} from '@/components/ui/dialog-scrollable';

/**
 * Exemple de formulaire scrollable pour mobile
 * 
 * Ce composant démontre comment utiliser le composant de dialogue scrollable
 * pour créer des formulaires qui fonctionnent correctement sur mobile
 */
const ScrollableFormExample = () => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <ScrollableDialog open={open} onOpenChange={setOpen}>
      <ScrollableDialogTrigger asChild>
        <Button variant="outline">Ouvrir le formulaire scrollable</Button>
      </ScrollableDialogTrigger>
      
      <ScrollableDialogContent className="sm:max-w-[425px]">
        <ScrollableDialogHeader>
          <ScrollableDialogTitle>Ajouter un équipement</ScrollableDialogTitle>
          <ScrollableDialogDescription>
            Remplissez ce formulaire pour ajouter un nouvel équipement.
          </ScrollableDialogDescription>
        </ScrollableDialogHeader>

        <form className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'équipement</Label>
            <Input id="name" placeholder="Tracteur John Deere" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select>
              <SelectTrigger id="type">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tractor">Tracteur</SelectItem>
                <SelectItem value="harvester">Moissonneuse</SelectItem>
                <SelectItem value="irrigation">Système d'irrigation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="manufacturer">Fabricant</Label>
            <Input id="manufacturer" placeholder="John Deere" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model">Modèle</Label>
            <Input id="model" placeholder="8R 410" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="serial">Numéro de série</Label>
            <Input id="serial" placeholder="JD8410R123456789" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Date d'achat</Label>
            <Input id="purchaseDate" type="date" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="year">Année</Label>
            <Input id="year" type="number" placeholder="2023" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Emplacement</Label>
            <Input id="location" placeholder="Hangar principal" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Informations supplémentaires sur l'équipement..." 
              rows={4}
            />
          </div>
          
          {/* Éléments supplémentaires pour montrer le défilement */}
          <div className="space-y-2">
            <Label htmlFor="horsepower">Puissance (ch)</Label>
            <Input id="horsepower" type="number" placeholder="410" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fuelType">Type de carburant</Label>
            <Select>
              <SelectTrigger id="fuelType">
                <SelectValue placeholder="Sélectionner un type de carburant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="gasoline">Essence</SelectItem>
                <SelectItem value="electric">Électrique</SelectItem>
                <SelectItem value="hybrid">Hybride</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="totalHours">Heures totales</Label>
            <Input id="totalHours" type="number" placeholder="0" />
          </div>
        </form>
        
        <ScrollableDialogFooter>
          <Button type="submit" onClick={() => setOpen(false)}>Ajouter</Button>
        </ScrollableDialogFooter>
      </ScrollableDialogContent>
    </ScrollableDialog>
  );
};

export default ScrollableFormExample;
