
import { ReactElement } from "react";
import { Intervention } from "@/types/Intervention";

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

export interface InterventionReportPDFOptions {
  filename?: string;
  companyName?: string;
  companyLogo?: string;
  companyDetails?: string;
  signature?: string;
  reportNotes?: string;
  actualDuration?: number;
  images?: string[];
  technician?: string;
}

export interface InterventionReportPDFProps {
  intervention: Intervention;
  companyName?: string;
  companyLogo?: string;
  companyDetails?: string;
  signature?: string;
  reportNotes?: string;
  actualDuration?: number;
  images?: string[];
  technician?: string;
}
