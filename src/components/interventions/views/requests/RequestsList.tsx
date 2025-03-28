
import React from 'react';
import { Intervention } from '@/types/Intervention';
import RequestCard from './RequestCard';
import EmptyRequestsPlaceholder from './EmptyRequestsPlaceholder';

interface RequestsListProps {
  requests: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
  onAcceptRequest: (intervention: Intervention) => void;
  onRejectRequest: (intervention: Intervention) => void;
  onCreateRequest: () => void;
}

const RequestsList: React.FC<RequestsListProps> = ({ 
  requests, 
  onViewDetails, 
  onAcceptRequest, 
  onRejectRequest,
  onCreateRequest
}) => {
  if (requests.length === 0) {
    return <EmptyRequestsPlaceholder onCreateRequest={onCreateRequest} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {requests.map(request => (
        <RequestCard 
          key={request.id}
          request={request}
          onViewDetails={onViewDetails}
          onAccept={onAcceptRequest}
          onReject={onRejectRequest}
        />
      ))}
    </div>
  );
};

export default RequestsList;
