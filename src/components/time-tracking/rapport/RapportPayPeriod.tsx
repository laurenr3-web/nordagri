
import React from "react";
import PayPeriodSummary from "./PayPeriodSummary";

type Props = {
  isLoading: boolean;
  monthly: number;
  biWeekly: number;
};

const RapportPayPeriod: React.FC<Props> = ({ isLoading, monthly, biWeekly }) => (
  <div className="my-4">
    <PayPeriodSummary isLoading={isLoading} monthly={monthly} biWeekly={biWeekly} />
  </div>
);

export default RapportPayPeriod;
