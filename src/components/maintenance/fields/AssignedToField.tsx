
import React from 'react';
import { UserPlus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import FormFieldGroup from './FormFieldGroup';

interface AssignedToFieldProps {
  assignedTo: string;
  setAssignedTo: (staff: string) => void;
  staffOptions: string[];
  onAddStaffClick: () => void;
  isLoadingStaff?: boolean;
}

const AssignedToField: React.FC<AssignedToFieldProps> = ({ 
  assignedTo, 
  setAssignedTo, 
  staffOptions, 
  onAddStaffClick,
  isLoadingStaff = false 
}) => {
  return (
    <FormFieldGroup>
      <Label htmlFor="assignedTo">Assigné à</Label>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          {isLoadingStaff ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger id="assignedTo">
                <SelectValue placeholder="Sélectionner un technicien" />
              </SelectTrigger>
              <SelectContent>
                {staffOptions.length > 0 ? (
                  staffOptions.map((staff) => (
                    <SelectItem key={staff} value={staff}>
                      {staff}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Aucun personnel disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
        <Button 
          type="button" 
          size="icon" 
          variant="outline"
          onClick={onAddStaffClick}
          title="Ajouter un nouveau technicien"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>
    </FormFieldGroup>
  );
};

export default AssignedToField;
