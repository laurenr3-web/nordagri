
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OptiFieldMap from '@/components/optifield/OptiFieldMap';
import OptiFieldTimeline from '@/components/optifield/OptiFieldTimeline';
import OptiFieldHeader from '@/components/optifield/OptiFieldHeader';
import OptiFieldSummary from '@/components/optifield/OptiFieldSummary';
import OptiFieldChatInterface from '@/components/optifield/OptiFieldChatInterface';

const OptiField = () => {
  const [selectedView, setSelectedView] = useState<string>("map");
  const [trackingActive, setTrackingActive] = useState<boolean>(false);
  
  return (
    <div className="pt-6 pb-16 pl-4 pr-4 sm:pl-8 sm:pr-8 md:pl-12 md:pr-12 ml-0 md:ml-64">
      <div className="max-w-7xl mx-auto">
        <OptiFieldHeader 
          trackingActive={trackingActive}
          setTrackingActive={setTrackingActive}
        />
        
        <Tabs 
          value={selectedView} 
          onValueChange={setSelectedView}
          className="my-6"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="map">Carte</TabsTrigger>
            <TabsTrigger value="summary">Analyses</TabsTrigger>
            <TabsTrigger value="timeline">Historique</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="relative">
            <OptiFieldMap trackingActive={trackingActive} />
          </TabsContent>
          
          <TabsContent value="summary">
            <OptiFieldSummary />
          </TabsContent>
          
          <TabsContent value="timeline">
            <OptiFieldTimeline />
          </TabsContent>
        </Tabs>
        
        <OptiFieldChatInterface 
          trackingActive={trackingActive}
          setTrackingActive={setTrackingActive}
        />
      </div>
    </div>
  );
};

export default OptiField;
