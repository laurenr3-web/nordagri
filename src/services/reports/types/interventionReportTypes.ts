
import { jsPDF } from 'jspdf';

export interface InterventionReportOptions {
  farmName?: string;
  farmLogo?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  includeSignature?: boolean;
  includePhotos?: boolean;
  includeParts?: boolean;
  includeContact?: boolean;
}

// Déclaration pour étendre jsPDF avec autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
    internal: {
      events: any;
      scaleFactor: number;
      pageSize: {
        width: number;
        getWidth: () => number;
        height: number;
        getHeight: () => number;
      };
      pages: number[];
      getEncryptor(objectId: number): (data: string) => string;
      getNumberOfPages: () => number;
    };
  }
}
