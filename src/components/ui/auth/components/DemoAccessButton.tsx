
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DemoAccessButtonProps {
  onSuccess?: () => void;
}

const DemoAccessButton: React.FC<DemoAccessButtonProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDemoAccess = async () => {
    setLoading(true);
    
    try {
      // Identifiants de démonstration prédéfinis
      const demoCredentials = {
        email: 'demo@optitractor.com',
        password: 'Demo123!'
      };

      console.log('Tentative de connexion en mode démonstration...');
      
      // Essayer de se connecter avec les identifiants de démonstration
      const { data, error } = await supabase.auth.signInWithPassword(demoCredentials);
      
      if (error) {
        // Si le compte n'existe pas, l'informer à l'utilisateur
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Le compte de démonstration n\'est pas encore configuré. Veuillez contacter l\'administrateur.');
        } else {
          toast.error('Erreur lors de l\'accès à la démonstration: ' + error.message);
        }
        return;
      }
      
      if (!data.session) {
        throw new Error('Session de démonstration non créée');
      }
      
      // Connexion réussie en mode démonstration
      console.log('Connexion démonstration réussie:', new Date().toISOString());
      toast.success('Bienvenue dans la démonstration OptiTractor !');
      
      // Appeler le callback de succès
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erreur d\'accès à la démonstration:', error);
      toast.error('Une erreur est survenue lors de l\'accès à la démonstration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            ou
          </span>
        </div>
      </div>
      
      <Button 
        type="button"
        variant="outline" 
        className="w-full" 
        onClick={handleDemoAccess}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Chargement de la démonstration...
          </>
        ) : (
          <>
            <Eye className="mr-2 h-4 w-4" />
            Accès Démonstration
          </>
        )}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground">
        Explorez OptiTractor avec des données d'exemple
      </p>
    </div>
  );
};

export default DemoAccessButton;
