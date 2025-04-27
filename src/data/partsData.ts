
import { Part } from '@/types/Part';

export const partsData: Part[] = [
  {
    id: 1,
    name: 'Air Filter',
    partNumber: 'AF-JD-4290',
    category: 'filters',
    compatibility: [1, 2], // Changed from strings to numeric IDs
    manufacturer: 'John Deere',
    price: 89.99,
    stock: 15,
    location: 'Warehouse A',
    reorderPoint: 5,
    image: 'https://images.unsplash.com/photo-1642742381109-81e94659e783?q=80&w=500&auto=format&fit=crop',
    compatibleWith: ['John Deere 8R 410', 'John Deere 7R Series'] // Keep this for backward compatibility
  },
  {
    id: 2,
    name: 'Hydraulic Oil Filter',
    partNumber: 'HOF-3842',
    category: 'filters',
    compatibility: [3, 4], // Changed from strings to numeric IDs
    manufacturer: 'Case IH',
    price: 44.50,
    stock: 8,
    location: 'Warehouse A',
    reorderPoint: 4,
    image: 'https://images.unsplash.com/photo-1495086682705-5ead063c0e73?q=80&w=500&auto=format&fit=crop',
    compatibleWith: ['Case IH Axial-Flow', 'Case IH Magnum'] // Keep this for backward compatibility
  },
  {
    id: 3,
    name: 'Transmission Belt',
    partNumber: 'TB-NH-4502',
    category: 'drive',
    compatibility: [5, 6], // Changed from strings to numeric IDs
    manufacturer: 'New Holland',
    price: 76.25,
    stock: 3,
    location: 'Warehouse B',
    reorderPoint: 3,
    image: 'https://images.unsplash.com/photo-1534437900477-dae37bfc70a9?q=80&w=500&auto=format&fit=crop',
    compatibleWith: ['New Holland T6.180', 'New Holland T7 Series'] // Keep this for backward compatibility
  },
  {
    id: 4,
    name: 'Fuel Injector',
    partNumber: 'FI-KB-922',
    category: 'engine',
    compatibility: [7, 8], // Changed from strings to numeric IDs
    manufacturer: 'Kubota',
    price: 165.75,
    stock: 6,
    location: 'Warehouse A',
    reorderPoint: 4,
    image: 'https://images.unsplash.com/photo-1553588290-5c1980a86ef0?q=80&w=500&auto=format&fit=crop',
    compatibleWith: ['Kubota M7-172', 'Kubota M5 Series'] // Keep this for backward compatibility
  },
  {
    id: 5,
    name: 'Brake Pads',
    partNumber: 'BP-FT-331',
    category: 'brake',
    compatibility: [9, 10], // Changed from strings to numeric IDs
    manufacturer: 'Fendt',
    price: 94.99,
    stock: 10,
    location: 'Warehouse B',
    reorderPoint: 5,
    image: 'https://images.unsplash.com/photo-1578847939234-41e3c4cdad81?q=80&w=500&auto=format&fit=crop',
    compatibleWith: ['Fendt 942 Vario', 'Fendt 900 Series'] // Keep this for backward compatibility
  },
  {
    id: 6,
    name: 'Radiator Cap',
    partNumber: 'RC-JD-118',
    category: 'cooling',
    compatibility: [1, 11], // Changed from strings to numeric IDs
    manufacturer: 'John Deere',
    price: 25.50,
    stock: 22,
    location: 'Warehouse A',
    reorderPoint: 8,
    image: 'https://images.unsplash.com/photo-1562204352-e31d306961a7?q=80&w=500&auto=format&fit=crop',
    compatibleWith: ['John Deere 8R 410', 'John Deere 6 Series'] // Keep this for backward compatibility
  },
  {
    id: 7,
    name: 'Hydraulic Cylinder',
    partNumber: 'HC-MF-752',
    category: 'hydraulic',
    compatibility: [12, 13], // Changed from strings to numeric IDs
    manufacturer: 'Massey Ferguson',
    price: 289.99,
    stock: 2,
    location: 'Warehouse B',
    reorderPoint: 2,
    image: 'https://images.unsplash.com/photo-1620967390419-ad179d15bf32?q=80&w=500&auto=format&fit=crop',
    compatibleWith: ['Massey Ferguson 8S.245', 'Massey Ferguson 7S Series'] // Keep this for backward compatibility
  },
  {
    id: 8,
    name: 'Battery',
    partNumber: 'BAT-12-800',
    category: 'electrical',
    compatibility: [14], // Changed from strings to numeric IDs
    manufacturer: 'Universal',
    price: 159.75,
    stock: 4,
    location: 'Warehouse A',
    reorderPoint: 3,
    image: 'https://images.unsplash.com/photo-1620814923416-507f8d69e6c3?q=80&w=500&auto=format&fit=crop',
    compatibleWith: ['All Tractors'] // Keep this for backward compatibility
  }
];
