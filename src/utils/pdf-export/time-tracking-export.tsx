
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { TimeReportPDF } from './time-report';
import { TimeEntriesPDF } from './time-entries';
import { TableData, TimeReportPDFProps } from './types';

export const exportTimeReportToPDF = async (
  month: string,
  summary: TimeReportPDFProps['summary'],
  taskDistribution: TimeReportPDFProps['taskDistribution'],
  topEquipment: TimeReportPDFProps['topEquipment'],
  filename: string = 'rapport-de-temps'
): Promise<void> => {
  const blob = await pdf(
    <TimeReportPDF 
      month={month}
      summary={summary}
      taskDistribution={taskDistribution}
      topEquipment={topEquipment}
    />
  ).toBlob();
  
  saveAs(blob, `${filename}.pdf`);
};

export const exportTimeEntriesToPDF = async (
  title: string,
  subtitle: string,
  tableData: TableData,
  filename: string = 'sessions-de-temps'
): Promise<void> => {
  const blob = await pdf(
    <TimeEntriesPDF 
      title={title}
      subtitle={subtitle}
      tableData={tableData}
    />
  ).toBlob();
  
  saveAs(blob, `${filename}.pdf`);
};
