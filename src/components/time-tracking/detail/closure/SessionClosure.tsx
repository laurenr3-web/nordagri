
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TimeEntry } from "@/hooks/time-tracking/types"
import { SummarySection } from "./SummarySection"
import { QuickEditSection } from "./QuickEditSection"
import { AttachmentsSection } from "./AttachmentsSection"
import { SmartActionsSection } from "./SmartActionsSection"
import { ExportSection } from "./ExportSection"
import { useSessionClosure } from "./useSessionClosure"

interface SessionClosureProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TimeEntry;
  estimatedCost: number;
  onCreateIntervention: () => void;
}

export function SessionClosure({
  isOpen,
  onClose,
  entry,
  estimatedCost,
  onCreateIntervention
}: SessionClosureProps) {
  const {
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
  } = useSessionClosure(entry);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Clôture de session</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <SummarySection entry={entry} estimatedCost={estimatedCost} />
          
          <QuickEditSection
            notes={notes}
            setNotes={setNotes}
            material={material}
            setMaterial={setMaterial}
            quantity={quantity}
            setQuantity={setQuantity}
          />
          
          <AttachmentsSection
            selectedImage={selectedImage}
            onFileChange={handleFileChange}
          />
          
          <SmartActionsSection
            createRecurring={createRecurring}
            setCreateRecurring={setCreateRecurring}
            managerVerified={managerVerified}
            setManagerVerified={setManagerVerified}
            onCreateIntervention={onCreateIntervention}
          />
          
          <ExportSection
            onExportPDF={handleExportPDF}
            onSendEmail={handleSendEmail}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
