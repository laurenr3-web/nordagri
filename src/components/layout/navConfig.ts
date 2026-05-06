import {
  PieChart,
  CalendarCheck,
  Eye,
  Tractor,
  Wrench,
  Folder,
  Clock,
  BarChart3,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type NavPriority = 'primary' | 'secondary';

export interface NavItem {
  path: string;
  icon: LucideIcon;
  labelKey: string;
  mobileLabelKey: string;
  priority: NavPriority;
  /** When true, item is shown in the mobile bottom quick bar */
  mobileQuick?: boolean;
}

export interface NavGroup {
  id: string;
  labelKey: string; // section title (e.g. "TRAVAIL QUOTIDIEN")
  items: NavItem[];
}

/**
 * Centralized navigation model used by the desktop sidebar and the mobile menu.
 * Order = visual order. The first group is the most prominent.
 */
export const navGroups: NavGroup[] = [
  {
    id: 'daily',
    labelKey: 'nav.group.daily',
    items: [
      {
        path: '/dashboard',
        icon: PieChart,
        labelKey: 'navbar.dashboard',
        mobileLabelKey: 'mobilemenu.dashboard',
        priority: 'primary',
        mobileQuick: true,
      },
      {
        path: '/planning',
        icon: CalendarCheck,
        labelKey: 'navbar.planning',
        mobileLabelKey: 'mobilemenu.planning',
        priority: 'primary',
        mobileQuick: true,
      },
      {
        path: '/team',
        icon: Users,
        labelKey: 'navbar.team',
        mobileLabelKey: 'mobilemenu.team',
        priority: 'primary',
        mobileQuick: false,
      },
      {
        path: '/points',
        icon: Eye,
        labelKey: 'navbar.points',
        mobileLabelKey: 'mobilemenu.points',
        priority: 'primary',
        mobileQuick: true,
      },
    ],
  },
  {
    id: 'equipment',
    labelKey: 'nav.group.equipment',
    items: [
      {
        path: '/equipment',
        icon: Tractor,
        labelKey: 'navbar.equipment',
        mobileLabelKey: 'mobilemenu.equipment',
        priority: 'secondary',
      },
      {
        path: '/maintenance',
        icon: Wrench,
        labelKey: 'navbar.maintenance',
        mobileLabelKey: 'mobilemenu.maintenance',
        priority: 'secondary',
      },
      {
        path: '/parts',
        icon: Folder,
        labelKey: 'navbar.parts',
        mobileLabelKey: 'mobilemenu.parts',
        priority: 'secondary',
      },
    ],
  },
  {
    id: 'analysis',
    labelKey: 'nav.group.analysis',
    items: [
      {
        path: '/time-tracking',
        icon: Clock,
        labelKey: 'navbar.time',
        mobileLabelKey: 'mobilemenu.time',
        priority: 'secondary',
      },
      {
        path: '/time-tracking/statistics',
        icon: BarChart3,
        labelKey: 'navbar.statistics',
        mobileLabelKey: 'mobilemenu.statistics',
        priority: 'secondary',
      },
    ],
  },
];

/** Standalone "account" items, shown apart from the 3 themed groups. */
export const accountItem: NavItem = {
  path: '/settings',
  icon: Settings,
  labelKey: 'navbar.settings',
  mobileLabelKey: 'mobilemenu.settings',
  priority: 'secondary',
};

/** Items shown in the mobile bottom quick bar (in order). */
export const mobileQuickItems: NavItem[] = navGroups
  .flatMap((g) => g.items)
  .filter((i) => i.mobileQuick);