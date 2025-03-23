
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter, 
  SlidersHorizontal,
  Package,
  AlertCircle
} from 'lucide-react';

// Sample parts data
const partsData = [
  {
    id: 1,
    name: 'Air Filter',
    partNumber: 'AF-JD-4290',
    category: 'filters',
    compatibility: ['John Deere 8R 410', 'John Deere 7R Series'],
    manufacturer: 'John Deere',
    price: 89.99,
    stock: 15,
    location: 'Warehouse A',
    reorderPoint: 5,
    image: 'https://images.unsplash.com/photo-1642742381109-81e94659e783?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Hydraulic Oil Filter',
    partNumber: 'HOF-3842',
    category: 'filters',
    compatibility: ['Case IH Axial-Flow', 'Case IH Magnum'],
    manufacturer: 'Case IH',
    price: 44.50,
    stock: 8,
    location: 'Warehouse A',
    reorderPoint: 4,
    image: 'https://images.unsplash.com/photo-1495086682705-5ead063c0e73?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Transmission Belt',
    partNumber: 'TB-NH-4502',
    category: 'drive',
    compatibility: ['New Holland T6.180', 'New Holland T7 Series'],
    manufacturer: 'New Holland',
    price: 76.25,
    stock: 3,
    location: 'Warehouse B',
    reorderPoint: 3,
    image: 'https://images.unsplash.com/photo-1534437900477-dae37bfc70a9?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 4,
    name: 'Fuel Injector',
    partNumber: 'FI-KB-922',
    category: 'engine',
    compatibility: ['Kubota M7-172', 'Kubota M5 Series'],
    manufacturer: 'Kubota',
    price: 165.75,
    stock: 6,
    location: 'Warehouse A',
    reorderPoint: 4,
    image: 'https://images.unsplash.com/photo-1553588290-5c1980a86ef0?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 5,
    name: 'Brake Pads',
    partNumber: 'BP-FT-331',
    category: 'brake',
    compatibility: ['Fendt 942 Vario', 'Fendt 900 Series'],
    manufacturer: 'Fendt',
    price: 94.99,
    stock: 10,
    location: 'Warehouse B',
    reorderPoint: 5,
    image: 'https://images.unsplash.com/photo-1578847939234-41e3c4cdad81?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 6,
    name: 'Radiator Cap',
    partNumber: 'RC-JD-118',
    category: 'cooling',
    compatibility: ['John Deere 8R 410', 'John Deere 6 Series'],
    manufacturer: 'John Deere',
    price: 25.50,
    stock: 22,
    location: 'Warehouse A',
    reorderPoint: 8,
    image: 'https://images.unsplash.com/photo-1562204352-e31d306961a7?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 7,
    name: 'Hydraulic Cylinder',
    partNumber: 'HC-MF-752',
    category: 'hydraulic',
    compatibility: ['Massey Ferguson 8S.245', 'Massey Ferguson 7S Series'],
    manufacturer: 'Massey Ferguson',
    price: 289.99,
    stock: 2,
    location: 'Warehouse B',
    reorderPoint: 2,
    image: 'https://images.unsplash.com/photo-1620967390419-ad179d15bf32?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 8,
    name: 'Battery',
    partNumber: 'BAT-12-800',
    category: 'electrical',
    compatibility: ['All Tractors'],
    manufacturer: 'Universal',
    price: 159.75,
    stock: 4,
    location: 'Warehouse A',
    reorderPoint: 3,
    image: 'https://images.unsplash.com/photo-1620814923416-507f8d69e6c3?q=80&w=500&auto=format&fit=crop'
  }
];

const Parts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentView, setCurrentView] = useState('grid');
  
  // Filter parts based on search term and category
  const filteredParts = partsData.filter(part => {
    const matchesSearch = 
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || part.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-6 pb-16 pl-4 pr-4 sm:pl-8 sm:pr-8 md:pl-12 md:pr-12 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="chip chip-secondary mb-2">Inventory Management</div>
                <h1 className="text-3xl font-medium tracking-tight mb-1">Parts Catalog</h1>
                <p className="text-muted-foreground">
                  Manage your agricultural equipment parts inventory
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Button className="gap-2">
                  <Plus size={16} />
                  <span>Add Parts</span>
                </Button>
              </div>
            </div>
          </header>
          
          <BlurContainer className="p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search part name, number, manufacturer..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2" size="sm">
                  <Filter size={16} />
                  <span>Filter</span>
                </Button>
                <Button variant="outline" className="gap-2" size="sm">
                  <SlidersHorizontal size={16} />
                  <span>Sort</span>
                </Button>
                <Button variant="outline" size="icon" className={currentView === 'grid' ? 'bg-secondary' : ''} onClick={() => setCurrentView('grid')}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 2H6.5V6.5H2V2ZM2 8.5H6.5V13H2V8.5ZM8.5 2H13V6.5H8.5V2ZM8.5 8.5H13V13H8.5V8.5Z" fill="currentColor"/>
                  </svg>
                </Button>
                <Button variant="outline" size="icon" className={currentView === 'list' ? 'bg-secondary' : ''} onClick={() => setCurrentView('list')}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 3H13V5H2V3ZM2 7H13V9H2V7ZM2 11H13V13H2V11Z" fill="currentColor"/>
                  </svg>
                </Button>
              </div>
            </div>
          </BlurContainer>
          
          <Tabs defaultValue="all" className="mb-6" value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">All Parts</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="engine">Engine</TabsTrigger>
              <TabsTrigger value="drive">Drive System</TabsTrigger>
              <TabsTrigger value="hydraulic">Hydraulic</TabsTrigger>
              <TabsTrigger value="electrical">Electrical</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {currentView === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredParts.map((part, index) => (
                <BlurContainer 
                  key={part.id} 
                  className="overflow-hidden animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src={part.image} 
                      alt={part.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
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
                  
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-medium">{part.name}</h3>
                      <p className="text-sm text-muted-foreground">{part.partNumber}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Manufacturer</p>
                        <p className="font-medium">{part.manufacturer}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-medium">${part.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stock</p>
                        <p className={`font-medium ${part.stock <= part.reorderPoint ? 'text-destructive' : ''}`}>
                          {part.stock} units
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">{part.location}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-1">Compatible with:</p>
                      <div className="flex flex-wrap gap-1">
                        {part.compatibility.slice(0, 2).map((equipment, i) => (
                          <span key={i} className="text-xs bg-secondary py-1 px-2 rounded-md">
                            {equipment}
                          </span>
                        ))}
                        {part.compatibility.length > 2 && (
                          <span className="text-xs bg-secondary py-1 px-2 rounded-md">
                            +{part.compatibility.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border flex justify-between">
                      <Button variant="outline" size="sm">Details</Button>
                      <Button variant="default" size="sm">Order</Button>
                    </div>
                  </div>
                </BlurContainer>
              ))}
            </div>
          ) : (
            <BlurContainer className="overflow-hidden rounded-lg animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="text-left p-3 font-medium">Image</th>
                      <th className="text-left p-3 font-medium">Part Name</th>
                      <th className="text-left p-3 font-medium">Part Number</th>
                      <th className="text-left p-3 font-medium">Manufacturer</th>
                      <th className="text-left p-3 font-medium">Price</th>
                      <th className="text-left p-3 font-medium">Stock</th>
                      <th className="text-left p-3 font-medium">Location</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredParts.map((part) => (
                      <tr key={part.id} className="hover:bg-secondary/30">
                        <td className="p-3">
                          <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                            <img 
                              src={part.image} 
                              alt={part.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="p-3 font-medium">{part.name}</td>
                        <td className="p-3">{part.partNumber}</td>
                        <td className="p-3">{part.manufacturer}</td>
                        <td className="p-3">${part.price.toFixed(2)}</td>
                        <td className="p-3">
                          <span className={part.stock <= part.reorderPoint ? 'text-destructive font-medium' : ''}>
                            {part.stock} {part.stock <= part.reorderPoint && (
                              <AlertCircle size={14} className="inline ml-1" />
                            )}
                          </span>
                        </td>
                        <td className="p-3">{part.location}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-8 px-2">Details</Button>
                            <Button variant="default" size="sm" className="h-8 px-2">Order</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </BlurContainer>
          )}
          
          {filteredParts.length === 0 && (
            <div className="mt-10 text-center">
              <p className="text-muted-foreground">No parts found matching your criteria.</p>
              <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
                Reset filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Parts;
