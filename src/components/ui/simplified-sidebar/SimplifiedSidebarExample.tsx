
import React from 'react';
import { 
  SimplifiedSidebarProvider, 
  SimplifiedSidebar, 
  SidebarToggle, 
  SidebarItem, 
  SidebarSection 
} from './index';
import { Home, Settings, User, Menu } from 'lucide-react';

export const SimplifiedSidebarExample: React.FC = () => {
  return (
    <SimplifiedSidebarProvider>
      <div className="flex min-h-screen">
        <SimplifiedSidebar className="bg-card border-r border-border">
          <div className="flex justify-center items-center h-14 border-b border-border">
            <SidebarToggle>
              <Menu className="h-5 w-5" />
            </SidebarToggle>
          </div>
          
          <SidebarSection title="Main">
            <SidebarItem 
              href="/dashboard" 
              icon={<Home className="h-5 w-5" />}
              isActive={window.location.pathname === '/dashboard'}
            >
              Dashboard
            </SidebarItem>
            
            <SidebarItem 
              href="/settings" 
              icon={<Settings className="h-5 w-5" />}
              isActive={window.location.pathname === '/settings'}
            >
              Settings
            </SidebarItem>
            
            <SidebarItem 
              href="/profile" 
              icon={<User className="h-5 w-5" />}
              isActive={window.location.pathname === '/profile'}
            >
              Profile
            </SidebarItem>
          </SidebarSection>
        </SimplifiedSidebar>
        
        <main className="flex-1 p-6">
          {/* Main content goes here */}
          <h1 className="text-2xl font-bold mb-4">Main Content</h1>
          <p>This is an example of using the simplified sidebar component.</p>
        </main>
      </div>
    </SimplifiedSidebarProvider>
  );
};

export default SimplifiedSidebarExample;
