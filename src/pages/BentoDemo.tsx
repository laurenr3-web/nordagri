
import React from 'react';
import { Bell, Home, HelpCircle, Settings, Shield, Mail, User, FileText, Lock } from "lucide-react";
import { ExpandableTabs, TabItem } from "@/components/ui/expandable-tabs";
import MainLayout from "@/ui/layouts/MainLayout";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

function DefaultDemo() {
  const tabs: TabItem[] = [
    { title: "Dashboard", icon: Home },
    { title: "Notifications", icon: Bell },
    { type: "separator" as const },
    { title: "Settings", icon: Settings },
    { title: "Support", icon: HelpCircle },
    { title: "Security", icon: Shield },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-2">Default Expandable Tabs</h2>
      <ExpandableTabs tabs={tabs} />
    </div>
  );
}

function CustomColorDemo() {
  const tabs: TabItem[] = [
    { title: "Profile", icon: User },
    { title: "Messages", icon: Mail },
    { type: "separator" as const },
    { title: "Documents", icon: FileText },
    { title: "Privacy", icon: Lock },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-2">Custom Color Expandable Tabs</h2>
      <ExpandableTabs 
        tabs={tabs} 
        activeColor="text-blue-500"
        className="border-blue-200 dark:border-blue-800" 
      />
    </div>
  );
}

function BentoGridDemo() {
  const features = [
    {
      Icon: FileText,
      name: "Gestion des documents",
      description: "Stockez et organisez vos documents agricoles facilement.",
      href: "/",
      cta: "En savoir plus",
      background: (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <FileText size={200} />
        </div>
      ),
      className: "lg:col-span-2 lg:row-span-1",
    },
    {
      Icon: Bell,
      name: "Notifications",
      description: "Recevez des alertes pour vos équipements et interventions.",
      href: "/",
      cta: "Configurer",
      background: (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Bell size={200} />
        </div>
      ),
      className: "lg:col-span-1 lg:row-span-2",
    },
    {
      Icon: Home,
      name: "Tableau de bord",
      description: "Visualisez toutes vos données en un coup d'œil.",
      href: "/dashboard",
      cta: "Accéder",
      background: (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Home size={200} />
        </div>
      ),
      className: "lg:col-span-1 lg:row-span-1",
    },
    {
      Icon: Settings,
      name: "Paramètres",
      description: "Personnalisez votre expérience utilisateur.",
      href: "/settings",
      cta: "Configurer",
      background: (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Settings size={200} />
        </div>
      ),
      className: "lg:col-span-1 lg:row-span-1",
    },
    {
      Icon: Shield,
      name: "Sécurité",
      description: "Protégez vos données et votre compte.",
      href: "/",
      cta: "Vérifier",
      background: (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Shield size={200} />
        </div>
      ),
      className: "lg:col-span-1 lg:row-span-1",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-2">Bento Grid Demo</h2>
      <BentoGrid className="lg:grid-rows-2">
        {features.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>
    </div>
  );
}

export default function BentoDemo() {
  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        <h1 className="text-3xl font-bold">Component Demos</h1>
        <DefaultDemo />
        <CustomColorDemo />
        <BentoGridDemo />
      </div>
    </MainLayout>
  );
}
