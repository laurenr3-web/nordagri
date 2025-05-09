
import React from 'react';

interface EquipmentImageFallbackProps {
  item: any;
}

export const EquipmentImageFallback: React.FC<EquipmentImageFallbackProps> = ({ item }) => {
  const getColorForCategory = (category: string) => {
    const colorMap: Record<string, string> = {
      'tracteur': 'bg-green-100 text-green-600',
      'moissonneuse': 'bg-yellow-100 text-yellow-600',
      'chariot': 'bg-blue-100 text-blue-600',
      'pulvérisateur': 'bg-purple-100 text-purple-600',
      'semoir': 'bg-pink-100 text-pink-600',
    };
    
    return colorMap[category?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  };

  const getInitials = () => {
    if (!item.name) return '??';
    const words = item.name.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return `${words[0].substring(0, 2)}`.toUpperCase();
  };

  const colorClass = getColorForCategory(item.category);
  
  return (
    <div className={`h-full w-full flex items-center justify-center ${colorClass}`}>
      <span className="text-2xl font-semibold">{getInitials()}</span>
    </div>
  );
};
