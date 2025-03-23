
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  apiKeyInput: string;
  setApiKeyInput: (value: string) => void;
  onSave: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({
  isOpen,
  onOpenChange,
  apiKeyInput,
  setApiKeyInput,
  onSave
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurer la clé API Google Maps</DialogTitle>
          <DialogDescription>
            Cette clé est nécessaire pour afficher les cartes et géolocaliser vos équipements.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Clé API Google Maps</Label>
              <Input 
                id="api-key" 
                placeholder="Entrez votre clé API Google Maps" 
                value={apiKeyInput} 
                onChange={e => setApiKeyInput(e.target.value)} 
                className="font-mono text-sm"
                autoComplete="off"
              />
            </div>
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
              <AlertDescription className="text-sm text-muted-foreground">
                Vous pouvez obtenir une clé API dans la <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Console Google Cloud</a>.
                Activez les API Maps JavaScript et Geocoding.
              </AlertDescription>
            </Alert>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onSave} disabled={!apiKeyInput.trim()}>
            Enregistrer et appliquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
