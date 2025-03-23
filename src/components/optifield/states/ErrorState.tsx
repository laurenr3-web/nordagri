
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Navbar from '@/components/layout/Navbar';

interface ErrorStateProps {
  onConfigureApiKey: () => void;
  onReload: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ onConfigureApiKey, onReload }) => {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <motion.div 
        className="flex-1 md:ml-64 flex items-center justify-center p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col items-center justify-center gap-6 max-w-md">
          <div className="p-4 bg-destructive/10 rounded-full">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <Alert variant="destructive" className="mb-2">
            <AlertTitle className="text-lg">Erreur de configuration</AlertTitle>
            <AlertDescription>
              Nous avons besoin d'une clé API Google Maps valide pour afficher vos champs et équipements. Veuillez configurer votre clé API pour continuer.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button 
              onClick={onConfigureApiKey} 
              className="px-4 py-2 bg-primary text-primary-foreground gap-2 flex items-center justify-center w-full sm:w-auto"
            >
              <KeyRound className="h-4 w-4" />
              Configurer la clé API
            </Button>
            <Button 
              onClick={onReload} 
              variant="outline" 
              className="px-4 py-2 gap-2 flex items-center justify-center w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Recharger la page
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorState;
