
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TimeEntry } from "@/hooks/time-tracking/types"
import { SummarySection } from "./SummarySection"
import { QuickEditSection } from "./QuickEditSection"
import { AttachmentsSection } from "./AttachmentsSection"
import { SmartActionsSection } from "./SmartActionsSection"
import { ExportSection } from "./ExportSection"
import { useSessionClosure } from "./useSessionClosure"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SessionClosureProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onStartNewTask?: () => void;
  entry: TimeEntry;
  estimatedCost: number;
  onCreateIntervention: () => void;
}

export function SessionClosure({
  isOpen,
  onClose,
  onSubmit,
  onStartNewTask,
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

  const handleSubmit = () => {
    onSubmit({
      notes,
      material,
      quantity,
      createRecurring,
      managerVerified,
      selectedImage
    });
  };

  const handleSubmitAndStartNew = () => {
    onSubmit({
      notes,
      material,
      quantity,
      createRecurring,
      managerVerified,
      selectedImage,
      startNewTask: true
    });

    if (onStartNewTask) {
      onStartNewTask();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Clôture de session</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
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
        </ScrollArea>

        <DialogFooter className="mt-6 flex justify-between flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={handleSubmitAndStartNew}
              className="flex-1"
            >
              Terminer et démarrer nouvelle tâche
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex-1"
            >
              Terminer la session
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
