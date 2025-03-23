
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const LoadingState: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <motion.div 
        className="flex-1 md:ml-64 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-lg font-medium">Chargement d'OptiField...</p>
          <p className="text-sm text-muted-foreground">Préparation de vos données agricoles</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingState;
