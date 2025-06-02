
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, Info } from 'lucide-react';
import { useDemoMode } from './auth/components/DemoDataProvider';

const DemoBanner: React.FC = () => {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-800">
      <Eye className="h-4 w-4" />
      <AlertDescription className="flex items-center gap-2">
        <Info className="h-4 w-4" />
        <span className="font-medium">Mode Démonstration</span>
        <span className="text-sm">
          Vous explorez OptiTractor avec des données d'exemple. Les modifications ne seront pas sauvegardées de façon permanente.
        </span>
      </AlertDescription>
    </Alert>
  );
};

export default DemoBanner;
