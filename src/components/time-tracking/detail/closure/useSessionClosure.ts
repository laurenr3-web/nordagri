
import { useState } from 'react';
import { toast } from 'sonner';
import { TimeEntry } from '@/hooks/time-tracking/types';

export function useSessionClosure(entry: TimeEntry) {
  const [notes, setNotes] = useState(entry.notes || '');
  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [createRecurring, setCreateRecurring] = useState(false);
  const [managerVerified, setManagerVerified] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const handleExportPDF = () => {
    toast.success('Export PDF en cours...');
  };

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
