
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational':
      return 'bg-agri-100 text-agri-800';
    case 'maintenance':
      return 'bg-harvest-100 text-harvest-800';
    case 'repair':
      return 'bg-destructive/20 text-destructive';
    default:
      return 'bg-secondary text-muted-foreground';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'operational':
      return 'Operational';
    case 'maintenance':
      return 'In Maintenance';
    case 'repair':
      return 'Needs Repair';
    default:
      return status;
  }
};
