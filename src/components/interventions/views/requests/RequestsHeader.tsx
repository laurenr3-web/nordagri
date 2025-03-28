
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RequestsHeaderProps {
  requestCount: number;
  onCreateRequest: () => void;
}

const RequestsHeader: React.FC<RequestsHeaderProps> = ({ requestCount, onCreateRequest }) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-medium text-lg">Demandes d'intervention ({requestCount})</h3>
      <Button 
        onClick={onCreateRequest}
        size="sm"
        className="gap-1"
      >
        <Plus size={16} />
        <span>Nouvelle demande</span>
      </Button>
    </div>
  );
};

export default RequestsHeader;
