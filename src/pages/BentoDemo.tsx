
import React from "react";
import MainLayout from "@/ui/layouts/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { BentoGridDemo } from "@/components/BentoGridDemo";

export default function BentoDemo() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Découvrez nos fonctionnalités" 
          description="Explorez les différents outils disponibles pour gérer vos équipements et interventions."
        />
        
        <BentoGridDemo />
      </div>
    </MainLayout>
  );
}
