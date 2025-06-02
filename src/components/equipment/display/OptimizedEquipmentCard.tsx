
import React, { useState, useRef, useEffect, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Clock, Wrench, Tractor, Truck, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageService, ImageMetadata } from '@/services/imageService';
import { ImageQualityIndicator } from '../images/ImageQualityIndicator';

interface EquipmentUsage {
  hours: number;
  target: number;
}

interface NextService {
  type: string;
  due: string;
}

interface OptimizedEquipmentCardProps {
  name: string;
  type: string;
  category?: string;
  image: string;
  status: 'operational' | 'maintenance' | 'repair' | 'inactive';
  usage?: EquipmentUsage;
  nextService?: NextService;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
  index?: number;
}

const OptimizedEquipmentCard: React.FC<OptimizedEquipmentCardProps> = memo(({ 
  name, 
  type, 
  category,
  image, 
  status, 
  usage, 
  nextService,
  onClick,
  className = "",
  style,
  compact = false,
  index = 0
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata>();
  const [isRetrying, setIsRetrying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load image with retry when visible
  useEffect(() => {
    if (isVisible && image && !imageError && !imageLoaded) {
      loadImageWithRetry();
    }
  }, [isVisible, image, imageError, imageLoaded]);

  const loadImageWithRetry = async () => {
    if (!image) return;
    
    try {
      setIsRetrying(true);
      const metadata = await ImageService.loadImageWithRetry(image, {
        maxRetries: 2,
        baseDelay: 500
      });
      
      setImageMetadata(metadata);
      setImageLoaded(true);
      setImageError(false);
    } catch (error) {
      console.error('Failed to load image after retries:', error);
      setImageError(true);
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maintenance': return <Wrench className="h-4 w-4 text-blue-500" />;
      case 'repair': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'repair': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = () => {
    switch (category?.toLowerCase()) {
      case 'tracteur': return <Tractor className="h-8 w-8" />;
      case 'camion': case 'truck': return <Truck className="h-8 w-8" />;
      default: return <Settings className="h-8 w-8" />;
    }
  };

  const getCategoryColor = () => {
    switch (category?.toLowerCase()) {
      case 'tracteur': return 'bg-green-100 text-green-600';
      case 'camion': case 'truck': return 'bg-blue-100 text-blue-600';
      case 'moissonneuse': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const isOverdue = nextService?.due.includes('retard') || nextService?.due.includes('Overdue');
  const isUpcoming = nextService?.due.includes('jours') || nextService?.due.includes('demain') || nextService?.due.includes('semaine');

  if (compact) {
    return (
      <Card 
        ref={cardRef}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]",
          "border border-agri-100 bg-gradient-to-r from-white to-agri-25",
          className
        )}
        style={{
          ...style,
          animationDelay: `${index * 0.02}s`
        }}
        onClick={onClick}
      >
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 relative">
              {isVisible && !imageError && image ? (
                <>
                  {isRetrying && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {imageLoaded && (
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </>
              ) : (
                <div className={cn("w-full h-full flex items-center justify-center", getCategoryColor())}>
                  {getCategoryIcon()}
                </div>
              )}
              {imageMetadata && (
                <div className="absolute top-1 right-1">
                  <ImageQualityIndicator metadata={imageMetadata} compact />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-agri-900 truncate text-sm">{name}</h4>
                <Badge className={cn("text-xs border", getStatusColor())}>
                  {status === 'operational' && 'OK'}
                  {status === 'maintenance' && 'Maintenance'}
                  {status === 'repair' && 'Réparation'}
                  {status === 'inactive' && 'Inactif'}
                </Badge>
              </div>
              
              <p className="text-xs text-agri-600 mb-2">{type}</p>
              
              {nextService && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-agri-500" />
                  <span className={cn(
                    "text-xs font-medium",
                    isOverdue ? 'text-red-600' : isUpcoming ? 'text-harvest-600' : 'text-agri-600'
                  )}>
                    {nextService.due}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const usagePercentage = usage ? Math.min(Math.round((usage.hours / usage.target) * 100), 100) : 0;
  const progressColor = usagePercentage > 90 ? 'bg-orange-500' : 'bg-emerald-500';

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group",
        className
      )}
      style={{
        ...style,
        animationDelay: `${index * 0.02}s`
      }}
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden">
        {!isVisible ? (
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        ) : imageError || !image ? (
          <div className={cn("w-full h-full flex flex-col items-center justify-center", getCategoryColor())}>
            {getCategoryIcon()}
            <span className="text-xs font-medium mt-2 text-center px-2">{type}</span>
          </div>
        ) : (
          <>
            {(isRetrying || !imageLoaded) && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {imageLoaded && (
              <img 
                src={image} 
                alt={name} 
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                loading="lazy"
              />
            )}
          </>
        )}
        
        <div className="absolute top-2 right-2">
          <Badge className={cn("rounded-md shadow-sm", getStatusColor())}>
            {status === 'operational' && 'Opérationnel'}
            {status === 'maintenance' && 'Maintenance'}
            {status === 'repair' && 'Réparation'}
            {status === 'inactive' && 'Inactif'}
          </Badge>
        </div>

        {imageMetadata && (
          <div className="absolute top-2 left-2">
            <ImageQualityIndicator metadata={imageMetadata} compact />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-muted-foreground text-sm mb-4">{type}</p>
        
        {usage && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1.5">
              <span>Utilisation</span>
              <span className="font-medium">{usage.hours} / {usage.target} hrs</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className={cn("h-2 rounded-full transition-all duration-500", progressColor)}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        )}
        
        {nextService && (
          <div className="flex items-center gap-1.5 text-sm mt-3">
            {isOverdue ? (
              <AlertTriangle size={16} className="text-red-500" />
            ) : isUpcoming ? (
              <Clock size={16} className="text-orange-500" /> 
            ) : (
              <CheckCircle size={16} className="text-green-500" />
            )}
            <span className={cn(
              "font-medium",
              isOverdue ? 'text-red-600' : isUpcoming ? 'text-orange-600' : 'text-green-600'
            )}>
              {nextService.due}
            </span>
          </div>
        )}

        {imageMetadata && !compact && (
          <div className="mt-4 pt-3 border-t">
            <ImageQualityIndicator metadata={imageMetadata} />
          </div>
        )}
      </div>
    </Card>
  );
});

OptimizedEquipmentCard.displayName = 'OptimizedEquipmentCard';

export { OptimizedEquipmentCard };
