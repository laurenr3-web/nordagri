
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ObservationForm } from '@/components/observations/ObservationForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlurContainer } from '@/components/ui/blur-container';
import { useFieldObservations } from '@/hooks/observations/useFieldObservations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, EyeOff, AlertTriangle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { UrgencyLevel } from '@/types/FieldObservation';

const UrgencyBadge = ({ level }: { level: UrgencyLevel }) => {
  const getBadgeClass = () => {
    switch (level) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'surveiller':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClass()}`}>
      {level === 'urgent' && <AlertTriangle className="w-3 h-3 mr-1" />}
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
};

const ObservationCard = ({ observation }: { observation: any }) => (
  <BlurContainer className="p-4 transition-all hover:shadow-md">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold">{observation.equipment}</h3>
        <p className="text-sm text-gray-500">{observation.observation_type}</p>
      </div>
      <UrgencyBadge level={observation.urgency_level} />
    </div>
    
    {observation.description && (
      <p className="mt-2 text-sm line-clamp-2">{observation.description}</p>
    )}
    
    <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
      <span>{format(new Date(observation.created_at), 'dd/MM/yyyy HH:mm')}</span>
      <span>{observation.location || 'Aucune localisation'}</span>
    </div>
    
    {observation.photos && observation.photos.length > 0 && (
      <div className="mt-2 flex gap-1">
        {observation.photos.slice(0, 3).map((photo: string, idx: number) => (
          <img 
            key={idx} 
            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/field-observations/${photo}`}
            alt="Observation" 
            className="w-12 h-12 object-cover rounded"
          />
        ))}
        {observation.photos.length > 3 && (
          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-sm">
            +{observation.photos.length - 3}
          </div>
        )}
      </div>
    )}
  </BlurContainer>
);

const FieldObservationsView: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { observations, isLoading } = useFieldObservations();

  // Pour tester - afficher les observations dans la console
  console.log('Observations:', observations);

  const filteredObservations = observations.filter(observation => {
    if (activeTab === 'all') return true;
    if (activeTab === 'urgent') return observation.urgency_level === 'urgent';
    if (activeTab === 'surveiller') return observation.urgency_level === 'surveiller';
    if (activeTab === 'normal') return observation.urgency_level === 'normal';
    return true;
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Observations terrain</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Nouvelle observation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvelle observation terrain</DialogTitle>
            </DialogHeader>
            <ObservationForm onSuccess={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="all" className="flex items-center">
            <Eye className="mr-1 h-4 w-4" />
            Toutes
          </TabsTrigger>
          <TabsTrigger value="urgent" className="flex items-center">
            <AlertTriangle className="mr-1 h-4 w-4" />
            Urgent
          </TabsTrigger>
          <TabsTrigger value="surveiller">À surveiller</TabsTrigger>
          <TabsTrigger value="normal">Normal</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="w-full">
          {isLoading ? (
            <div className="text-center py-12">Chargement des observations...</div>
          ) : filteredObservations.length === 0 ? (
            <BlurContainer className="p-12 text-center">
              <EyeOff className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500">Aucune observation terrain trouvée</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsFormOpen(true)}>
                Créer une observation
              </Button>
            </BlurContainer>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredObservations.map((observation) => (
                <ObservationCard key={observation.id} observation={observation} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FieldObservationsView;
