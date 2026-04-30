
import { Send, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HelpTooltip } from '@/components/help/HelpTooltip';

interface ExportSectionProps {
  onExportPDF: () => void;
  onSendEmail: () => void;
}

export function ExportSection({ onExportPDF, onSendEmail }: ExportSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>Export et envoi</span>
        <HelpTooltip contentKey="time.field.export" />
      </div>
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1" onClick={onExportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Exporter PDF
        </Button>
        <Button variant="outline" className="flex-1" onClick={onSendEmail}>
          <Send className="mr-2 h-4 w-4" />
          Envoyer par email
        </Button>
      </div>
    </div>
  )
}
