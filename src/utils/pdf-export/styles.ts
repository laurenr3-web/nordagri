
import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  subheader: {
    fontSize: 16,
    marginBottom: 10,
  },
  summary: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  summaryLabel: {
    width: '50%',
    fontWeight: 'bold',
  },
  summaryValue: {
    width: '50%',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableHeaderCell: {
    padding: 5,
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: 'grey',
  },
  chart: {
    height: 150,
    marginBottom: 20,
  },
});
