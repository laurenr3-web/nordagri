
import React from 'react';
import { Part } from '@/types/Part';
import { WithdrawalHistoryErrorBoundary } from './withdrawal-history/ErrorBoundary';
import ContentWrapper from './withdrawal-history/ContentWrapper';

interface WithdrawalHistoryProps {
  part: Part;
}

const WithdrawalHistory: React.FC<WithdrawalHistoryProps> = (props) => {
  return (
    <WithdrawalHistoryErrorBoundary>
      <ContentWrapper {...props} />
    </WithdrawalHistoryErrorBoundary>
  );
};

export default WithdrawalHistory;
