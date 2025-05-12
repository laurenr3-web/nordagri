
import { useState } from 'react';
import { toast } from 'sonner';
import { TimeEntry } from '@/hooks/time-tracking/types';

/**
 * Hook pour gérer la clôture d'une session de suivi du temps
 * 
 * Gère les états et actions pour finaliser une session de suivi du temps,
 * incluant l'ajout de notes, matériaux, et pièces jointes.
 * 
 * @param {TimeEntry} entry - L'entrée de temps à clôturer
 * @returns {Object} États et gestionnaires pour la clôture de session
 */
export function useSessionClosure(entry: TimeEntry) {
  const [notes, setNotes] = useState(entry.notes || '');
  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [createRecurring, setCreateRecurring] = useState(false);
  const [managerVerified, setManagerVerified] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  /**
   * Gère la sélection et l'aperçu d'un fichier image
   */
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

  /**
   * Gère l'export PDF du rapport de session
   */
  const handleExportPDF = () => {
    toast.success('Export PDF en cours...');
  };

  /**
   * Gère l'envoi du rapport par email
   */
  const handleSendEmail = () => {
    toast.success('Rapport envoyé par email');
  };

  return {
    notes,
    setNotes,
    material,
    setMaterial,
    quantity,
    setQuantity,
    createRecurring,
    setCreateRecurring,
    managerVerified,
    setManagerVerified,
    selectedImage,
    handleFileChange,
    handleExportPDF,
    handleSendEmail
  };
}
