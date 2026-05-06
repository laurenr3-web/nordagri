import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TodayTab } from '@/components/team/TodayTab';
import { WeekTab } from '@/components/team/WeekTab';
import { ToNotForgetTab } from '@/components/team/ToNotForgetTab';

export default function Team() {
  return (
    <div className="container mx-auto px-3 py-4 max-w-2xl">
      <header className="mb-3">
        <h1 className="text-xl font-bold">Équipe & Horaire</h1>
        <p className="text-xs text-muted-foreground">Qui travaille, qui fait quoi, et ce qu'il ne faut pas oublier.</p>
      </header>
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="today" className="text-[12px]">Aujourd'hui</TabsTrigger>
          <TabsTrigger value="week" className="text-[12px]">Semaine</TabsTrigger>
          <TabsTrigger value="notforget" className="text-[12px]">À ne pas oublier</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-3">
          <TodayTab />
        </TabsContent>
        <TabsContent value="week" className="mt-3">
          <WeekTab />
        </TabsContent>
        <TabsContent value="notforget" className="mt-3">
          <ToNotForgetTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}