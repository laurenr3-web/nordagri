
import React from "react";

interface RapportContainerProps {
  children: React.ReactNode;
}
const RapportContainer: React.FC<RapportContainerProps> = ({ children }) => (
  <div className="max-w-screen-xl mx-auto w-full px-4 md:px-8 min-h-[600px] overflow-x-hidden">
    {children}
  </div>
);

export default RapportContainer;
