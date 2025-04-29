
import { Intervention } from "@/types/Intervention";

// Helper function to format date
export const formatDate = (date: Date) => {
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
    case 'canceled':
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
    coordinates: {
      lat: 34.052235,
      lng: -118.243683
    },
    status: 'completed',
    priority: 'high',
    date: new Date(2023, 5, 5),
    duration: 3.5,
    technician: 'Michael Torres',
    description: 'Hydraulic hose burst during operation. Emergency repair performed on-site.',
    partsUsed: [
      { id: 101, name: 'Hydraulic Hose 3/4"', quantity: 1 },
      { id: 102, name: 'Quick Connect Fitting', quantity: 2 }
    ],
    notes: 'Recommend full hydraulic system inspection during next scheduled maintenance.'
  },
  {
    id: 2,
    title: 'Harvester Setup Configuration',
    equipment: 'Case IH Axial-Flow',
    equipmentId: 2,
    location: 'East Field',
    coordinates: {
      lat: 34.056235,
      lng: -118.253683
    },
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
    coordinates: {
      lat: 34.050235,
      lng: -118.233683
    },
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
    coordinates: {
      lat: 34.048235,
      lng: -118.263683
    },
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
    coordinates: {
      lat: 34.062235,
      lng: -118.273683
    },
    status: 'completed',
    priority: 'low',
    date: new Date(2023, 5, 8),
    duration: 1,
    technician: 'Michael Torres',
    description: 'Adjustment of tire pressure for optimal field conditions.',
    partsUsed: [],
    notes: 'All tires now set to manufacturer recommended PSI for current soil conditions.'
  },
  {
    id: 6,
    title: 'Transmission Diagnostic',
    equipment: 'Fendt 942 Vario',
    equipmentId: 6,
    location: 'Central Field',
    coordinates: {
      lat: 34.049235,
      lng: -118.253683
    },
    status: 'canceled',
    priority: 'high',
    date: new Date(2023, 5, 7),
    scheduledDuration: 3,
    technician: 'David Chen',
    description: 'Investigate reported transmission slipping issue.',
    partsUsed: [],
    notes: 'Intervention canceled - equipment needed for urgent field operation. Rescheduled for June 14.'
  },
  {
    id: 7,
    title: 'Air Conditioning Repair',
    equipment: 'Massey Ferguson 8S.245',
    equipmentId: 4,
    location: 'East Field',
    coordinates: {
      lat: 34.058235,
      lng: -118.243683
    },
    status: 'completed',
    priority: 'medium',
    date: new Date(2023, 5, 6),
    duration: 2.5,
    technician: 'Sarah Johnson',
    description: 'Cabin AC not cooling properly. Refrigerant leak suspected.',
    partsUsed: [
      { id: 103, name: 'AC Refrigerant R134a', quantity: 1 },
      { id: 104, name: 'O-Ring Seal Kit', quantity: 1 }
    ],
    notes: 'Leak found and sealed. System recharged and working properly.'
  },
  {
    id: 8,
    title: 'Fuel System Cleaning',
    equipment: 'John Deere 8R 410',
    equipmentId: 1,
    location: 'Workshop',
    coordinates: {
      lat: 34.052235,
      lng: -118.243683
    },
    status: 'scheduled',
    priority: 'medium',
    date: new Date(2023, 5, 18),
    scheduledDuration: 3,
    technician: 'Michael Torres',
    description: 'Scheduled fuel system cleaning and injector service.',
    partsUsed: [],
    notes: 'Part of seasonal maintenance program.'
  }
];
