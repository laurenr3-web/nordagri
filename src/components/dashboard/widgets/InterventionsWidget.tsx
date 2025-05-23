
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InterventionsWidgetProps {
  data: any[];
  loading: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
}

export const InterventionsWidget = ({ data, loading, size }: InterventionsWidgetProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl">
              <div className="w-10 h-10 bg-red-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-red-200 rounded w-3/4"></div>
                <div className="h-3 bg-red-150 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const displayLimit = size === 'small' ? 2 : size === 'medium' ? 3 : 5;
  const interventionsToShow = data?.slice(0, displayLimit) || [];

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          gradient: 'from-red-400 to-red-600',
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-700',
          icon: Zap
        };
      case 'medium':
        return {
          gradient: 'from-harvest-400 to-harvest-600',
          bg: 'bg-harvest-50 border-harvest-200',
          text: 'text-harvest-700',
          icon: AlertTriangle
        };
      default:
        return {
          gradient: 'from-agri-400 to-agri-600',
          bg: 'bg-agri-50 border-agri-200',
          text: 'text-agri-700',
          icon: Clock
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-agri-900">Interventions urgentes</h3>
          <p className="text-sm text-agri-600 mt-1">Actions critiques requises</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Voir tout
        </Button>
      </div>
      
      <div className="space-y-3">
        {interventionsToShow.map((intervention, index) => {
          const config = getPriorityConfig(intervention.priority);
          const IconComponent = config.icon;
          
          return (
            <motion.div
              key={intervention.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={cn(
                "group relative overflow-hidden rounded-xl border transition-all duration-300",
                "hover:shadow-lg hover:scale-[1.02] cursor-pointer",
                config.bg
              )}
            >
              <div className="flex items-center gap-4 p-4">
                <div className={cn(
                  "relative p-3 rounded-xl bg-gradient-to-br shadow-sm",
                  config.gradient
                )}>
                  <IconComponent className="h-5 w-5 text-white" />
                  {intervention.priority === 'high' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-agri-900 group-hover:text-agri-700 transition-colors truncate">
                      {intervention.title}
                    </h4>
                    <div className="flex items-center gap-2 ml-2">
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full uppercase tracking-wide",
                        intervention.priority === 'high' ? 'bg-red-100 text-red-700' :
                        intervention.priority === 'medium' ? 'bg-harvest-100 text-harvest-700' :
                        'bg-agri-100 text-agri-700'
                      )}>
                        {intervention.priority === 'high' ? 'Urgent' :
                         intervention.priority === 'medium' ? 'Moyen' : 'Normal'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-agri-600 mb-3">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{intervention.equipment}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{intervention.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-agri-500" />
                      <span className="text-xs text-agri-600">
                        {intervention.estimated_duration || 'Non estimé'}
                      </span>
                    </div>
                    
                    <div className="text-xs text-agri-500">
                      Créé {intervention.created_at ? new Date(intervention.created_at).toLocaleDateString('fr-FR') : 'récemment'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Pulsing effect for high priority */}
              {intervention.priority === 'high' && (
                <div className="absolute inset-0 bg-red-400/10 animate-pulse pointer-events-none"></div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </motion.div>
          );
        })}
      </div>
      
      {interventionsToShow.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-agri-100 to-agri-200 rounded-full flex items-center justify-center">
            <MapPin className="h-8 w-8 text-agri-500" />
          </div>
          <p className="text-agri-600 font-medium">Aucune intervention urgente</p>
          <p className="text-sm text-agri-500 mt-1">Situation sous contrôle</p>
        </div>
      )}
    </div>
  );
};
