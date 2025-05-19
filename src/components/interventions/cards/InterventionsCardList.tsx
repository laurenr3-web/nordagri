
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Intervention } from '@/types/Intervention';
import InterventionCard from '../InterventionCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface InterventionsCardListProps {
  interventions: Intervention[];
  emptyMessage: string;
  isMobile: boolean;
  onViewDetails: (intervention: Intervention) => void;
  onStartWork: (intervention: Intervention) => void;
}

const InterventionsCardList: React.FC<InterventionsCardListProps> = ({
  interventions,
  emptyMessage,
  isMobile,
  onViewDetails,
  onStartWork
}) => {
  if (interventions.length === 0) {
    return (
      <BlurContainer className="p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </BlurContainer>
    );
  }

  // Sur mobile, utiliser un carrousel pour afficher les interventions
  if (isMobile) {
    return (
      <Carousel
        className="w-full"
        opts={{ 
          align: "start",
          loop: false,
        }}
      >
        <CarouselContent className="-ml-2 -mr-2">
          {interventions.map((intervention) => (
            <CarouselItem key={intervention.id} className="pl-2 pr-2 basis-full sm:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <InterventionCard
                  intervention={intervention}
                  onViewDetails={onViewDetails}
                  onStartWork={onStartWork}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center mt-4">
          <CarouselPrevious className="relative static mr-2" />
          <CarouselNext className="relative static ml-2" />
        </div>
      </Carousel>
    );
  }

  // Sur desktop, utiliser la grille
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {interventions.map(intervention => (
        <InterventionCard 
          key={intervention.id} 
          intervention={intervention} 
          onViewDetails={onViewDetails} 
          onStartWork={onStartWork} 
        />
      ))}
    </div>
  );
};

export default InterventionsCardList;
