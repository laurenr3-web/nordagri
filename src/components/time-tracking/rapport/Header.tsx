
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

type HeaderProps = {
  isExporting: boolean;
  onExport: (type: 'pdf' | 'excel') => void;
};

const Header: React.FC<HeaderProps> = ({ isExporting, onExport }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="min-w-0">
      <h2 className="text-base sm:text-lg font-semibold tracking-tight">Rapports</h2>
      <p className="text-xs sm:text-sm text-muted-foreground">
        Comprendre où va le temps de l'équipe
      </p>
    </div>
    <div className="flex gap-2 shrink-0">
      <Button
        variant="outline"
        size="sm"
        className="rounded-full h-8 gap-1.5"
        onClick={() => onExport('pdf')}
        disabled={isExporting}
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">PDF</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full h-8 gap-1.5"
        onClick={() => onExport('excel')}
        disabled={isExporting}
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Excel</span>
      </Button>
    </div>
  </div>
);

export default Header;
