
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilePdf, FileSpreadsheet, FileDown, Download } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  isExporting: boolean;
  onExport: (type: 'pdf' | 'excel' | 'sessions-pdf') => void;
}

const Header: React.FC<HeaderProps> = ({ isExporting, onExport }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Rapport d'activité</h1>
        <p className="text-sm text-muted-foreground">
          Analyse de votre activité par période
        </p>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            Exporter {isExporting && '...'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => onExport('pdf')}>
            <FilePdf className="h-4 w-4 mr-2" />
            <span>Rapport PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport('excel')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <span>Exporter en Excel</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport('sessions-pdf')}>
            <FileDown className="h-4 w-4 mr-2" />
            <span>Liste des sessions (PDF)</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Header;
