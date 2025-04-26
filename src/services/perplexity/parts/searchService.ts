
import { Part } from '@/types/Part';

export async function searchParts(query: string): Promise<Part[]> {
  try {
    // Simulated search delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock results for demonstration
    const results: Part[] = [
      {
        id: 101,
        name: "Premium Air Filter",
        partNumber: "PAF-1001",
        category: "filters",
        compatibility: [1, 2, 3], // Changed to numbers
        manufacturer: "FilterMaster",
        price: 45.99,
        stock: 8,
        location: "Warehouse C",
        reorderPoint: 3,
        image: "https://images.unsplash.com/photo-1642742381109-81e94659e783?q=80&w=500&auto=format&fit=crop",
        description: "High-performance air filter for agricultural equipment",
        reference: "PAF-1001",
        compatibleWith: [1, 2, 3], // Changed to numbers
        purchasePrice: 35.00,
        quantity: 8,
        minimumStock: 3,
        estimatedPrice: 45.99,
        inStock: true,
        isFromSearch: true,
        imageUrl: "https://images.unsplash.com/photo-1642742381109-81e94659e783?q=80&w=500&auto=format&fit=crop"
      },
      {
        id: 102,
        name: "Heavy Duty Hydraulic Oil Filter",
        partNumber: "HOF-HD-2002",
        category: "filters",
        compatibility: [3, 4, 5], // Changed to numbers
        manufacturer: "HydroTech",
        price: 65.75,
        stock: 5,
        location: "Warehouse A",
        reorderPoint: 2,
        image: "https://images.unsplash.com/photo-1495086682705-5ead063c0e73?q=80&w=500&auto=format&fit=crop",
        description: "Industrial-grade hydraulic oil filter for heavy machinery",
        reference: "HOF-HD-2002",
        compatibleWith: [3, 4, 5], // Changed to numbers
        purchasePrice: 50.00,
        quantity: 5,
        minimumStock: 2,
        estimatedPrice: 65.75,
        inStock: true,
        isFromSearch: true,
        imageUrl: "https://images.unsplash.com/photo-1495086682705-5ead063c0e73?q=80&w=500&auto=format&fit=crop"
      },
    ];
    
    // Filter results based on query
    return results.filter(part => 
      part.name.toLowerCase().includes(query.toLowerCase()) || 
      part.partNumber.toLowerCase().includes(query.toLowerCase()) ||
      part.category.toLowerCase().includes(query.toLowerCase()) ||
      part.manufacturer.toLowerCase().includes(query.toLowerCase())
    );
    
  } catch (error) {
    console.error("Error searching parts:", error);
    return [];
  }
}
