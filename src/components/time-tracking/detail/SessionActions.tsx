
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface SessionActionsProps {
  status: 'active' | 'paused' | 'completed';
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateIntervention: () => void;
}

export const SessionActions = ({ status, onFileUpload, onCreateIntervention }: SessionActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            type="file"
            id="photo"
            className="hidden"
            accept="image/*"
            onChange={onFileUpload}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById('photo')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Ajouter une photo
          </Button>
        </div>
        
        <Button 
          className="w-full"
          onClick={onCreateIntervention}
        >
          <Plus className="mr-2 h-4 w-4" />
          Créer une intervention
        </Button>
      </CardContent>
    </Card>
  );
};
