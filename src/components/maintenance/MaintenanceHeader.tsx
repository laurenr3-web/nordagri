
import React from 'react';

interface MaintenanceHeaderProps {
  setIsNewTaskDialogOpen: (open: boolean) => void;
  userName?: string;
}

const MaintenanceHeader: React.FC<MaintenanceHeaderProps> = ({ 
  userName = 'Utilisateur'
}) => {
  // Ce composant n'affiche plus le bouton, car il est maintenant dans PageHeader
  return null;
};

export default MaintenanceHeader;
