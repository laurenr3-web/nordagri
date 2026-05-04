/**
 * Centralized tab configuration for routes that support `?tab=` query params.
 * Single source of truth — keep in sync with the page component using each route.
 *
 * Usage:
 *   import { TAB_ROUTES, buildTabUrl, isValidTab } from '@/config/tabRoutes';
 *   navigate(buildTabUrl('timeStatistics', 'time'));
 */

export interface TabRouteConfig {
  /** Base pathname (no query string) */
  path: string;
  /** Allowed tab values for this route */
  tabs: readonly string[];
  /** Default tab — omitted from the URL when active */
  defaultTab: string;
}

export const TAB_ROUTES = {
  timeStatistics: {
    path: '/time-tracking/statistics',
    tabs: ['overview', 'hours', 'time'],
    defaultTab: 'overview',
  },
  planning: {
    path: '/planning',
    tabs: ['today', 'tomorrow', 'week', 'completed'],
    defaultTab: 'today',
  },
  settings: {
    path: '/settings',
    tabs: ['profile', 'farm', 'security', 'notifications', 'subscription'],
    defaultTab: 'profile',
  },
} as const satisfies Record<string, TabRouteConfig>;

export type TabRouteKey = keyof typeof TAB_ROUTES;

export type TabValue<K extends TabRouteKey> = (typeof TAB_ROUTES)[K]['tabs'][number];

/** Returns true if `tab` is a valid value for the given route key. */
export function isValidTab<K extends TabRouteKey>(key: K, tab: string | null | undefined): tab is TabValue<K> {
  if (!tab) return false;
  return (TAB_ROUTES[key].tabs as readonly string[]).includes(tab);
}

/** Resolves to the configured tab if valid, otherwise the route's default tab. */
export function resolveTab<K extends TabRouteKey>(key: K, tab: string | null | undefined): TabValue<K> {
  return (isValidTab(key, tab) ? tab : TAB_ROUTES[key].defaultTab) as TabValue<K>;
}

/** Builds a URL like `/path?tab=value`, omitting the param when it equals the default. */
export function buildTabUrl<K extends TabRouteKey>(key: K, tab: TabValue<K>): string {
  const cfg = TAB_ROUTES[key];
  if (tab === cfg.defaultTab) return cfg.path;
  return `${cfg.path}?tab=${tab}`;
}