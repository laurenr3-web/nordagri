
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WITHDRAWAL_REASONS } from '@/hooks/parts/usePartsWithdrawal';

interface ReasonSelectorProps {
  reason: string;
  setReason: (value: string) => void;
  customReason: string;
  setCustomReason: (value: string) => void;
  errors: {
    reason?: string;
    customReason?: string;
    quantity?: string;
  };
}

export const ReasonSelector: React.FC<ReasonSelectorProps> = ({
  reason,
  setReason,
  customReason,
  setCustomReason,
  errors
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="reason">Raison du retrait *</Label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger id="reason" className={errors.reason ? "border-destructive" : ""}>
            <SelectValue placeholder="Sélectionner une raison" />
          </SelectTrigger>
          <SelectContent>
            {WITHDRAWAL_REASONS.map((reasonOption) => (
              <SelectItem key={reasonOption.id} value={reasonOption.id}>
                {reasonOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.reason && (
          <p className="text-destructive text-sm">{errors.reason}</p>
        )}
      </div>
      
      {/* Champ pour "Autre" raison */}
      {reason === 'other' && (
        <div className="space-y-2">
          <Label htmlFor="customReason">Précisez la raison *</Label>
          <Input 
            id="customReason" 
            value={customReason} 
            onChange={(e) => setCustomReason(e.target.value)}
            className={errors.customReason ? "border-destructive" : ""}
          />
          {errors.customReason && (
            <p className="text-destructive text-sm">{errors.customReason}</p>
          )}
        </div>
      )}
    </>
  );
};
