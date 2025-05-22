
import { ReactElement } from "react";

export interface PDFGenerationResult {
  blob: Blob;
  url: string;
  filename: string;
  contentType: string;
  download: () => void;
}

export interface TimeReportPDFProps {
  month: string;
  summary: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  taskDistribution: Array<{
    type: string;
    hours: number;
    percentage: number;
  }>;
  topEquipment: Array<{
    id?: number;
    name: string;
    hours: number;
  }>;
}

export interface TimeEntriesPDFProps {
  title: string;
  subtitle: string;
  tableData: {
    headers: Array<{
      key: string;
      label: string;
    }>;
    rows: Array<Record<string, any>>;
  };
}

export interface TableData {
  headers: Array<{
    key: string;
    label: string;
  }>;
  rows: Array<Record<string, any>>;
}
