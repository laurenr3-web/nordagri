
import { DialogWrapper } from "@/components/ui/dialog-wrapper";
import { PartWithdrawalForm } from "./PartWithdrawalForm";

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawalDialog({ open, onOpenChange }: WithdrawalDialogProps) {
  return (
    <DialogWrapper
      title="Retrait de pièce"
      description="Enregistrer un nouveau retrait de pièce"
      open={open}
      onOpenChange={onOpenChange}
    >
      <PartWithdrawalForm />
    </DialogWrapper>
  );
}
