
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { TimeEntry } from "@/hooks/time-tracking/types"
import { SummarySection } from "./SummarySection"
import { QuickEditSection } from "./QuickEditSection"
import { AttachmentsSection } from "./AttachmentsSection"
import { SmartActionsSection } from "./SmartActionsSection"
import { ExportSection } from "./ExportSection"
import { useSessionClosure } from "./useSessionClosure"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"

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

  const isMobile = useIsMobile();

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

  const formContent = (
    <div className="space-y-4">
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
  );

  const formButtons = (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
        Annuler
      </Button>
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Button 
          variant="secondary" 
          onClick={handleSubmitAndStartNew}
          className="w-full"
        >
          Terminer et démarrer nouvelle tâche
        </Button>
        <Button 
          onClick={handleSubmit}
          className="w-full"
        >
          Terminer la session
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] p-4" style={{ maxHeight: '90vh' }}>
          <SheetHeader className="mb-2">
            <SheetTitle className="text-lg">Clôture de session</SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 overflow-y-auto pr-2" style={{ height: 'calc(90vh - 140px)' }}>
            {formContent}
          </ScrollArea>

          <SheetFooter className="flex flex-col pt-4 sticky bottom-0 bg-background border-t mt-4">
            {formButtons}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Clôture de session</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {formContent}
        </ScrollArea>

        <DialogFooter className="mt-6">
          {formButtons}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
