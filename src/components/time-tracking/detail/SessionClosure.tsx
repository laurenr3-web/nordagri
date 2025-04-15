
import React from 'react';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, DollarSign, FileImage, Send, FileText, Wrench, User, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface SessionClosureProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TimeEntry;
}

export const SessionClosure = ({ isOpen, onClose, entry }: SessionClosureProps) => {
  const [notes, setNotes] = React.useState(entry.notes || '');
  const [material, setMaterial] = React.useState('');
  const [quantity, setQuantity] = React.useState('1');
  const [createRecurring, setCreateRecurring] = React.useState(false);
  const [managerVerified, setManagerVerified] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('Photo ajoutée avec succès');
    }
  };

  const handleCreateIntervention = () => {
    // Implement intervention creation logic
    toast.success('Intervention créée');
  };

  const handleExportPDF = () => {
    toast.success('Export PDF en cours...');
  };

  const handleSendEmail = () => {
    toast.success('Rapport envoyé par email');
  };

  const formatDuration = (startTime: string | Date) => {
    const start = new Date(startTime);
    const end = new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  const calculateCost = (startTime: string | Date, hourlyRate: number = 50) => {
    const start = new Date(startTime);
    const end = new Date();
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return (hours * hourlyRate).toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Clôture de session</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bloc 1: Résumé */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Résumé de la session</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Durée : {formatDuration(entry.start_time)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Coût : ${calculateCost(entry.start_time)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.user_name ? `https://api.dicebear.com/7.x/initials/svg?seed=${entry.user_name}` : ''} />
                  <AvatarFallback>{entry.user_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{entry.user_name || 'Utilisateur'}</p>
                  <p className="text-sm text-muted-foreground">{entry.equipment_name || 'Équipement non spécifié'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bloc 2: Édition rapide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Édition rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes finales</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajouter des notes finales..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Matériel utilisé</Label>
                  <Select value={material} onValueChange={setMaterial}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filter">Filtre</SelectItem>
                      <SelectItem value="oil">Huile</SelectItem>
                      <SelectItem value="parts">Pièces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantité</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bloc 3: Pièces jointes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pièces jointes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <FileImage className="mr-2 h-4 w-4" />
                  Ajouter une photo
                </Button>
                
                {selectedImage && (
                  <div className="relative w-24 h-24">
                    <img
                      src={selectedImage}
                      alt="Uploaded"
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bloc 4: Actions intelligentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={handleCreateIntervention}>
                <Plus className="mr-2 h-4 w-4" />
                Créer une intervention liée
              </Button>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={createRecurring}
                  onCheckedChange={(checked) => setCreateRecurring(checked as boolean)}
                />
                <label
                  htmlFor="recurring"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Créer une tâche récurrente
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={managerVerified}
                  onCheckedChange={(checked) => setManagerVerified(checked as boolean)}
                />
                <label
                  htmlFor="verified"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Session vérifiée par gestionnaire
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Bloc 5: Export & Suivi */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleSendEmail}>
              <Send className="mr-2 h-4 w-4" />
              Envoyer par email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
