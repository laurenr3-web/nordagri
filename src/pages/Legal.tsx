
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LegalMentions from "@/components/legal/LegalMentions";
import LegalCGU from "@/components/legal/LegalCGU";
import LegalConfidentiality from "@/components/legal/LegalConfidentiality";

const LegalPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Informations légales</h1>
        <Tabs defaultValue="mentions" className="w-full">
          <TabsList className="w-full flex justify-between sticky top-0 z-10">
            <TabsTrigger value="mentions" className="flex-1">Mentions légales</TabsTrigger>
            <TabsTrigger value="cgu" className="flex-1">CGU</TabsTrigger>
            <TabsTrigger value="confidentiality" className="flex-1">Confidentialité</TabsTrigger>
          </TabsList>
          <TabsContent value="mentions">
            <LegalMentions />
          </TabsContent>
          <TabsContent value="cgu">
            <LegalCGU />
          </TabsContent>
          <TabsContent value="confidentiality">
            <LegalConfidentiality />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LegalPage;
