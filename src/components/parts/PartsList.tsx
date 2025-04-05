
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Part {
  id: number;
  name: string;
  partNumber: string;
  category: string;
  compatibility: string[];
  manufacturer: string;
  price: number;
  stock: number;
  location: string;
  reorderPoint: number;
  image: string;
}

interface PartsListProps {
  parts: Part[];
  openPartDetails: (part: Part) => void;
  openOrderDialog: (part: Part) => void;
}

const PartsList: React.FC<PartsListProps> = ({ parts, openPartDetails, openOrderDialog }) => {
  return (
    <BlurContainer className="overflow-hidden rounded-lg animate-fade-in h-full">
      <div className="overflow-x-auto h-full">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-secondary/50">
              <th className="text-left p-2 font-medium">Image</th>
              <th className="text-left p-2 font-medium">Part Name</th>
              <th className="text-left p-2 font-medium">Part Number</th>
              <th className="text-left p-2 font-medium">Manufacturer</th>
              <th className="text-left p-2 font-medium">Price</th>
              <th className="text-left p-2 font-medium">Stock</th>
              <th className="text-left p-2 font-medium">Location</th>
              <th className="text-left p-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-secondary/30">
                <td className="p-2">
                  <div 
                    className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0 cursor-pointer" 
                    onClick={() => openPartDetails(part)}
                  >
                    <img 
                      src={part.image} 
                      alt={part.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Set a default image if the part image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/100x100/png?text=No+Image';
                      }}
                    />
                  </div>
                </td>
                <td className="p-2 font-medium">{part.name}</td>
                <td className="p-2">{part.partNumber}</td>
                <td className="p-2">{part.manufacturer}</td>
                <td className="p-2">${part.price.toFixed(2)}</td>
                <td className="p-2">
                  <span className={part.stock <= part.reorderPoint ? 'text-destructive font-medium' : ''}>
                    {part.stock} {part.stock <= part.reorderPoint && (
                      <AlertCircle size={14} className="inline ml-1" />
                    )}
                  </span>
                </td>
                <td className="p-2">{part.location}</td>
                <td className="p-2">
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2" 
                      onClick={() => openPartDetails(part)}
                      aria-label="Voir les détails de la pièce"
                    >
                      Details
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="h-7 px-2" 
                      onClick={() => openOrderDialog(part)}
                      aria-label="Commander cette pièce"
                    >
                      Order
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BlurContainer>
  );
};

export default PartsList;
