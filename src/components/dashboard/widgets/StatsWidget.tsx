
import React from 'react';
import { Tractor, Wrench, Package, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StatsCard } from '@/components/dashboard/StatsCard';

interface StatsWidgetProps {
  data: any;
  loading: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
}

export const StatsWidget = ({ data, loading, size }: StatsWidgetProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Équipements actifs',
      value: data?.activeEquipment || 0,
      icon: Tractor,
      onClick: () => navigate('/equipment')
    },
    {
      title: 'Tâches maintenance',
      value: data?.maintenanceTasks?.total || 0,
      icon: Wrench,
      onClick: () => navigate('/maintenance')
    },
    {
      title: 'Stock pièces',
      value: data?.partsInventory?.total || 0,
      icon: Package,
      onClick: () => navigate('/parts')
    },
    {
      title: 'Interventions',
      value: data?.fieldInterventions || 0,
      icon: MapPin,
      onClick: () => navigate('/interventions')
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {stats.map((stat, index) => (
        <motion.div key={index} variants={item}>
          <div 
            className="p-4 bg-card border rounded-lg cursor-pointer hover:bg-accent transition-colors"
            onClick={stat.onClick}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
