
import React from 'react';
import { Document, Page, View } from '@react-pdf/renderer';
import { Intervention } from '@/types/Intervention';
import {
  reportStyles,
  ReportHeader,
  GeneralInfoSection,
  EquipmentSection,
  DescriptionSection,
  TimeSection,
  PartsSection,
  NotesSection,
  ReportFooter
} from './components';

interface InterventionReportPDFProps {
  intervention: Intervention;
  reportNotes?: string;
  actualDuration?: number;
}

export const InterventionReportPDF: React.FC<InterventionReportPDFProps> = ({ 
  intervention,
  reportNotes,
  actualDuration
}) => (
  <Document>
    <Page size="A4" style={reportStyles.page}>
      <ReportHeader 
        id={intervention.id} 
        date={intervention.date} 
      />
      
      <GeneralInfoSection intervention={intervention} />
      
      <EquipmentSection 
        equipment={intervention.equipment} 
        equipmentId={intervention.equipmentId} 
      />
      
      <DescriptionSection description={intervention.description} />
      
      <TimeSection 
        scheduledDuration={intervention.scheduledDuration} 
        actualDuration={actualDuration || intervention.duration}
        status={intervention.status}
      />
      
      <PartsSection parts={intervention.partsUsed} />
      
      <NotesSection 
        notes={intervention.notes} 
        reportNotes={reportNotes} 
      />
      
      <ReportFooter />
    </Page>
  </Document>
);

export default InterventionReportPDF;
