
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const LowStockWarning: React.FC = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md flex items-start gap-2">
      <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-medium">Attention : stock bas</p>
        <p>Le retrait de cette pièce fera passer le stock sous le seuil minimal recommandé.</p>
      </div>
    </div>
  );
};
