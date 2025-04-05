
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRCodeErrorViewProps {
  title?: string;
  error: string;
  /** Fonction appelée lorsque l'utilisateur clique sur le bouton Réessayer */
  onRetry?: () => void;
  /** Destination où rediriger lorsque l'utilisateur clique sur un autre bouton (par défaut: '/equipment') */
  redirectPath?: string;
  /** Texte du bouton de redirection (par défaut: 'Voir tous les équipements') */
  redirectText?: string;
}

/**
 * Composant réutilisable pour afficher des erreurs de QR code
 */
const QRCodeErrorView: React.FC<QRCodeErrorViewProps> = ({
  title = "QR Code non valide",
  error,
  onRetry,
  redirectPath = '/equipment',
  redirectText = 'Voir tous les équipements'
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-destructive/10 p-6 rounded-lg text-center max-w-md">
        <div className="flex items-center justify-center mb-4">
          <QrCode className="h-12 w-12 text-destructive" />
          <AlertTriangle className="h-12 w-12 text-destructive ml-2" />
        </div>
        
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{error}</p>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate(redirectPath)}>
            {redirectText}
          </Button>
          
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Réessayer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeErrorView;
