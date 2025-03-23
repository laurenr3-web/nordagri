import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, BarChart2, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy loaded components
const OptiFieldMap = React.lazy(() => import('@/components/optifield/OptiFieldMap'));
const OptiFieldTimeline = React.lazy(() => import('@/components/optifield/OptiFieldTimeline'));
const OptiFieldHeader = React.lazy(() => import('@/components/optifield/OptiFieldHeader'));
const OptiFieldSummary = React.lazy(() => import('@/components/optifield/OptiFieldSummary'));
const OptiFieldChatInterface = React.lazy(() => import('@/components/optifield/OptiFieldChatInterface'));

// Fallback loader for Suspense
const ComponentLoader = () => <div className="w-full h-64 rounded-lg bg-card flex items-center justify-center">
    <Skeleton className="h-full w-full rounded-lg" />
  </div>;
interface OptiFieldContentProps {
  trackingActive: boolean;
  setTrackingActive: (active: boolean) => void;
}
const OptiFieldContent: React.FC<OptiFieldContentProps> = ({
  trackingActive,
  setTrackingActive
}) => {
  const [selectedView, setSelectedView] = React.useState<string>("map");
  const tabIcons = {
    map: <MapPin className="h-4 w-4 mr-2" />,
    summary: <BarChart2 className="h-4 w-4 mr-2" />,
    timeline: <Clock className="h-4 w-4 mr-2" />
  };
  return <div className="container py-10 md:py-16 md:px-8 lg:px-16 max-w-7xl mx-auto px-[138px]">
      <Suspense fallback={<ComponentLoader />}>
        <OptiFieldHeader trackingActive={trackingActive} setTrackingActive={setTrackingActive} />
      </Suspense>
      
      <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.3,
      delay: 0.1
    }} className="my-8">
        <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {Object.entries(tabIcons).map(([key, icon]) => <TabsTrigger key={key} value={key} className="flex items-center">
                {icon}
                <span>{key === 'map' ? 'Carte' : key === 'summary' ? 'Analyses' : 'Historique'}</span>
              </TabsTrigger>)}
          </TabsList>
          
          <div className="relative rounded-lg border bg-card">
            <TabsContent value="map" className="relative mt-0 p-0">
              <Suspense fallback={<ComponentLoader />}>
                <OptiFieldMap trackingActive={trackingActive} />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="summary" className="p-4 md:p-6">
              <Suspense fallback={<ComponentLoader />}>
                <OptiFieldSummary />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="timeline" className="p-4 md:p-6">
              <Suspense fallback={<ComponentLoader />}>
                <OptiFieldTimeline />
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
      
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.4,
      delay: 0.3
    }} className="mt-8">
        <Suspense fallback={<ComponentLoader />}>
          <OptiFieldChatInterface trackingActive={trackingActive} setTrackingActive={setTrackingActive} />
        </Suspense>
      </motion.div>
    </div>;
};
export default OptiFieldContent;