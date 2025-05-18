
import React from 'react';
import { Bell, Home, HelpCircle, Settings, Shield, Mail, User, FileText, Lock } from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import MainLayout from "@/ui/layouts/MainLayout";

function DefaultDemo() {
  const tabs = [
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
  const tabs = [
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

export default function BentoDemo() {
  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        <h1 className="text-3xl font-bold">Expandable Tabs Demo</h1>
        <DefaultDemo />
        <CustomColorDemo />
      </div>
    </MainLayout>
  );
}
