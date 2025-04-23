import React from 'react';
import { Sidebar, SidebarProvider, SidebarContent } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
interface MainLayoutProps {
  children: React.ReactNode;
}
import { useAuthContext } from "@/providers/AuthProvider";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingOverlay } from "@/components/onboarding/OnboardingOverlay";

export const MainLayout: React.FC<MainLayoutProps> = ({
  children
}) => {
  const { user } = useAuthContext();
  const { hasSeen, setFlag, loading } = useOnboarding(user?.id);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    // Autostart onboarding if first view and not currently loading
    if (user && hasSeen === false && !loading) setShowOnboarding(true);
  }, [user, hasSeen, loading]);

  const handleFinish = async () => {
    setShowOnboarding(false);
    await setFlag(true);
  };

  return (
    <>
      <OnboardingOverlay open={showOnboarding} onClose={handleFinish} />
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
          <Sidebar className="border-r border-sidebar-border bg-agri-dark">
            <SidebarContent>
              <Navbar />
            </SidebarContent>
          </Sidebar>
          <div className="flex-1 w-full overflow-x-hidden max-w-screen-xl mx-auto lg:px-12 px-[154px]">
            <div className="py-6">{children}</div>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};
export default MainLayout;
