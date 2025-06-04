
import React from 'react';
import { PartsContainer } from '@/components/parts/PartsContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/hooks/auth/useAuth';

const Parts = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access this page.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Gestion des pièces"
        description="Gérez votre inventaire de pièces détachées"
      />
      <PartsContainer />
    </div>
  );
};

export default Parts;
