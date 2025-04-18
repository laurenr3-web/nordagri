import * as React from "react"
import {
  LayoutDashboard,
  Settings,
  Tractor,
  Wrench,
  AlertTriangle,
  FileText,
  Users,
  BarChart3,
  Clock
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  return (
    <div className={cn("hidden border-r bg-white w-60 flex-col p-3 md:flex", className)} {...props}>
      <div className="flex flex-col space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "group flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:underline",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Tableau de bord</span>
        </NavLink>
        <NavLink
          to="/equipment"
          className={({ isActive }) =>
            cn(
              "group flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:underline",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <Tractor className="h-4 w-4" />
          <span>Équipement</span>
        </NavLink>
        <NavLink
          to="/maintenance"
          className={({ isActive }) =>
            cn(
              "group flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:underline",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <Wrench className="h-4 w-4" />
          <span>Maintenance</span>
        </NavLink>
        <NavLink
          to="/interventions"
          className={({ isActive }) =>
            cn(
              "group flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:underline",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Interventions</span>
        </NavLink>
        <NavLink
          to="/time-tracking"
          className={({ isActive }) =>
            cn(
              "group flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:underline",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <Clock className="h-4 w-4" />
          <span>Temps</span>
        </NavLink>
        <NavLink
          to="/parts"
          className={({ isActive }) =>
            cn(
              "group flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:underline",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <FileText className="h-4 w-4" />
          <span>Pièces</span>
        </NavLink>
        <NavLink
          to="/employees"
          className={({ isActive }) =>
            cn(
              "group flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:underline",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <Users className="h-4 w-4" />
          <span>Employés</span>
        </NavLink>
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            cn(
              "group flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:underline",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <BarChart3 className="h-4 w-4" />
          <span>Rapports</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "group flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:underline",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <Settings className="h-4 w-4" />
          <span>Paramètres</span>
        </NavLink>
      </div>
    </div>
  )
}

export function MobileNav() {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-background border-t h-16 px-1 md:hidden">
      <NavLink 
        to="/" 
        className={({ isActive }) => cn(
          "flex flex-col items-center justify-center w-full h-full",
          "text-[11px] space-y-1 py-1",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutDashboard className="h-5 w-5" />
        <span className="truncate">Tableau de bord</span>
      </NavLink>
      
      <NavLink 
        to="/equipment" 
        className={({ isActive }) => cn(
          "flex flex-col items-center justify-center w-full h-full",
          "text-[11px] space-y-1 py-1",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Tractor className="h-5 w-5" />
        <span className="truncate">Équipement</span>
      </NavLink>
      
      <NavLink 
        to="/maintenance" 
        className={({ isActive }) => cn(
          "flex flex-col items-center justify-center w-full h-full",
          "text-[11px] space-y-1 py-1",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Wrench className="h-5 w-5" />
        <span className="truncate">Maintenance</span>
      </NavLink>

      <NavLink 
        to="/interventions" 
        className={({ isActive }) => cn(
          "flex flex-col items-center justify-center w-full h-full",
          "text-[11px] space-y-1 py-1",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <AlertTriangle className="h-5 w-5" />
        <span className="truncate">Interventions</span>
      </NavLink>

      <NavLink 
        to="/time-tracking" 
        className={({ isActive }) => cn(
          "flex flex-col items-center justify-center w-full h-full",
          "text-[11px] space-y-1 py-1",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Clock className="h-5 w-5" />
        <span className="truncate">Temps</span>
      </NavLink>
      
      <NavLink 
        to="/parts" 
        className={({ isActive }) => cn(
          "flex flex-col items-center justify-center w-full h-full",
          "text-[11px] space-y-1 py-1",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <FileText className="h-5 w-5" />
        <span className="truncate">Pièces</span>
      </NavLink>

      <NavLink 
        to="/employees" 
        className={({ isActive }) => cn(
          "flex flex-col items-center justify-center w-full h-full",
          "text-[11px] space-y-1 py-1",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Users className="h-5 w-5" />
        <span className="truncate">Employés</span>
      </NavLink>

      <NavLink 
        to="/reports" 
        className={({ isActive }) => cn(
          "flex flex-col items-center justify-center w-full h-full",
          "text-[11px] space-y-1 py-1",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <BarChart3 className="h-5 w-5" />
        <span className="truncate">Rapports</span>
      </NavLink>

      <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "group flex flex-col items-center justify-center w-full h-full",
              "text-[11px] space-y-1 py-1",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <Settings className="h-5 w-5" />
          <span className="truncate">Paramètres</span>
        </NavLink>
    </nav>
  );
}

interface SidebarProviderProps {
  children: React.ReactNode
}

function SidebarProvider({ children }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <div className="h-full">
      {children}
    </div>
  )
}

export { SidebarProvider }
