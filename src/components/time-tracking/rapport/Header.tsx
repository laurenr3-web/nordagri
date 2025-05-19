
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

type HeaderProps = {
  isExporting: boolean;
  onExport: (type: 'pdf' | 'excel') => void;
};

const Header: React.FC<HeaderProps> = ({ isExporting, onExport }) => (
  <div className="flex flex-col space-y-2">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold">NordAgri</h2>
        <p className="text-sm text-muted-foreground">Plateforme de gestion agricole</p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={() => onExport('pdf')}
          disabled={isExporting}
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Exporter</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onExport('excel')}
          disabled={isExporting}
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Excel</span>
        </Button>
      </div>
    </div>
  </div>
);

export default Header;
