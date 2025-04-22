
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DownloadCloud, 
  FileText,
  FileCog 
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { CSVLink } from 'react-csv';

interface ExportButtonProps {
  data: any[];
  filename: string;
  headers?: { label: string; key: string }[];
  onExportPDF?: () => Promise<void>;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  disabled?: boolean;
}

export function ExportButton({
  data,
  filename,
  headers,
  onExportPDF,
  className,
  variant = 'outline',
  size = 'sm',
  disabled = false
}: ExportButtonProps) {
  const handlePDFExport = async () => {
    if (onExportPDF) {
      toast.info("Génération du PDF en cours...");
      try {
        await onExportPDF();
      } catch (error) {
        console.error("PDF export error:", error);
        toast.error("Erreur lors de l'export PDF");
      }
    } else {
      toast.info("Export PDF non disponible pour cette vue");
    }
  };

  // If no data, disable the button
  if (data.length === 0) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={className} 
        disabled
      >
        <DownloadCloud className="h-4 w-4 mr-2" />
        <span>Exporter</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className} 
          disabled={disabled}
        >
          <DownloadCloud className="h-4 w-4 mr-2" />
          <span>Exporter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <CSVLink 
          data={data} 
          headers={headers} 
          filename={`${filename}.csv`}
          className="w-full"
        >
          <DropdownMenuItem>
            <FileText className="h-4 w-4 mr-2" />
            <span>Export CSV</span>
          </DropdownMenuItem>
        </CSVLink>
        <DropdownMenuItem onClick={handlePDFExport}>
          <FileCog className="h-4 w-4 mr-2" />
          <span>Export PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
