import { Intervention } from "@/types/Intervention";

// Helper function to format date
export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper function for status badge
export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'scheduled':
      return "bg-secondary flex items-center gap-1 text-muted-foreground";
    case 'in-progress':
      return "bg-harvest-100 text-harvest-800 flex items-center gap-1";
    case 'completed':
      return "bg-agri-100 text-agri-800 flex items-center gap-1";
    case 'cancelled':
      return "bg-red-100 text-red-800 flex items-center gap-1";
    default:
      return "bg-secondary text-muted-foreground";
  }
};

// Helper function for priority badge
export const getPriorityBadgeClass = (priority: string) => {
  switch (priority) {
    case 'high':
      return "bg-red-100 text-red-800";
    case 'medium':
      return "bg-harvest-100 text-harvest-800";
    case 'low':
      return "bg-agri-100 text-agri-800";
    default:
      return "";
  }
};

// Sample field interventions data
export const interventionsData: Intervention[] = [
  {
    id: 1,
    title: 'Emergency Repair - Hydraulic System',
    equipment: 'John Deere 8R 410',
    equipmentId: 1,
    location: 'North Field',
    status: 'completed',
    priority: 'high',
    date: new Date(2023, 5, 5),
    duration: 3.5,
    scheduledDuration: 4,
    technician: 'Michael Torres',
    description: 'Hydraulic hose burst during operation. Emergency repair performed on-site.',
    partsUsed: [
      { partId: 101, name: 'Hydraulic Hose 3/4"', quantity: 1 },
      { partId: 102, name: 'Quick Connect Fitting', quantity: 2 }
    ],
    notes: 'Recommend full hydraulic system inspection during next scheduled maintenance.'
  },
  {
    id: 2,
    title: 'Harvester Setup Configuration',
    equipment: 'Case IH Axial-Flow',
    equipmentId: 2,
    location: 'East Field',
    status: 'in-progress',
    priority: 'medium',
    date: new Date(2023, 5, 10),
    scheduledDuration: 4,
    technician: 'Sarah Johnson',
    description: 'Pre-harvest setup and calibration for wheat harvesting season.',
    partsUsed: [],
    notes: 'Calibration needs to be completed before June 15.'
  },
  {
    id: 3,
    title: 'Starter Motor Replacement',
    equipment: 'Kubota M7-172',
    equipmentId: 3,
    location: 'Workshop',
    status: 'scheduled',
    priority: 'medium',
    date: new Date(2023, 5, 12),
    scheduledDuration: 2,
    technician: 'David Chen',
    description: 'Starter motor showing signs of failure. Preventive replacement before field work.',
    partsUsed: [],
    notes: 'Part ordered and expected to arrive June 11.'
  },
  {
    id: 4,
    title: 'GPS Precision Calibration',
    equipment: 'John Deere 8R 410',
    equipmentId: 1,
    location: 'South Field',
    status: 'scheduled',
    priority: 'low',
    date: new Date(2023, 5, 15),
    scheduledDuration: 2,
    technician: 'Sarah Johnson',
    description: 'Annual GPS calibration for precision farming systems.',
    partsUsed: [],
    notes: 'Calibration equipment needs to be brought from main office.'
  },
  {
    id: 5,
    title: 'Tire Pressure Adjustments',
    equipment: 'New Holland T6.180',
    equipmentId: 5,
    location: 'West Field',
    status: 'completed',
    priority: 'low',
    date: new Date(2023, 5, 8),
    duration: 1,
    scheduledDuration: 1,
    technician: 'Michael Torres',
    description: 'Adjustment of tire pressure for optimal field conditions.',
    partsUsed: [],
    notes: 'All tires now set to manufacturer recommended PSI for current soil conditions.'
  }
];
