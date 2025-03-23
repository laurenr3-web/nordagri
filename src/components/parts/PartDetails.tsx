
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Tag, 
  Package,
  Factory,
  Warehouse,
  AlertCircle
} from 'lucide-react';

interface PartDetailsProps {
  part: {
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
  };
}

const PartDetails: React.FC<PartDetailsProps> = ({ part }) => {
  return (
    <div className="space-y-6">
      <div className="relative aspect-video overflow-hidden rounded-md">
        <img 
          src={part.image} 
          alt={part.name}
          className="w-full h-full object-cover"
        />
        {part.stock <= part.reorderPoint && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle size={12} />
              <span>Low Stock</span>
            </Badge>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold">{part.name}</h2>
        <p className="text-muted-foreground">{part.partNumber}</p>
      </div>

      <Separator />
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-muted-foreground">Category</h3>
            <p className="font-medium flex items-center gap-2">
              <Tag size={16} className="text-muted-foreground" />
              {part.category.charAt(0).toUpperCase() + part.category.slice(1)}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm text-muted-foreground">Part Number</h3>
            <p className="font-medium">{part.partNumber}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-muted-foreground">Manufacturer</h3>
            <p className="font-medium flex items-center gap-2">
              <Factory size={16} className="text-muted-foreground" />
              {part.manufacturer}
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-muted-foreground">Price</h3>
            <p className="font-medium">${part.price.toFixed(2)}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-muted-foreground">Stock</h3>
            <p className={`font-medium flex items-center gap-2 ${part.stock <= part.reorderPoint ? 'text-destructive' : ''}`}>
              <Package size={16} className="text-muted-foreground" />
              {part.stock} units {part.stock <= part.reorderPoint && 
                <span className="text-xs bg-destructive/10 text-destructive py-1 px-2 rounded-md">
                  Low Stock
                </span>
              }
            </p>
          </div>
          
          <div>
            <h3 className="text-sm text-muted-foreground">Storage Location</h3>
            <p className="font-medium flex items-center gap-2">
              <Warehouse size={16} className="text-muted-foreground" />
              {part.location}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm text-muted-foreground mb-2">Compatible Equipment</h3>
        <div className="flex flex-wrap gap-2">
          {part.compatibility.map((equipment, index) => (
            <Badge key={index} variant="secondary" className="px-2 py-1">
              {equipment}
            </Badge>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-sm text-muted-foreground mb-2">Reorder Point</h3>
        <div className="p-4 bg-secondary/50 rounded-md">
          <div className="flex justify-between items-center">
            <span>Current Stock</span>
            <span className="font-medium">{part.stock} units</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span>Reorder Point</span>
            <span className="font-medium">{part.reorderPoint} units</span>
          </div>
          <div className="w-full bg-background rounded-full h-2 mt-4">
            <div 
              className={`h-2 rounded-full ${part.stock <= part.reorderPoint ? 'bg-destructive' : 'bg-primary'}`}
              style={{ width: `${Math.min(100, (part.stock / (part.reorderPoint * 2)) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartDetails;
