
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { TimeTracker } from '@/components/time-tracking/TimeTracker';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  navGroups,
  accountItem,
  mobileQuickItems,
  type NavItem,
} from './navConfig';

const MobileMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (location.pathname === '/auth') {
    return null;
  }

  const isItemActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/time-tracking') return location.pathname === '/time-tracking';
    return location.pathname.startsWith(path);
  };

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const QuickButton = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = isItemActive(item.path);
    return (
      <button
        type="button"
        onClick={() => go(item.path)}
        aria-label={t(item.labelKey)}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors min-w-0',
          active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Icon className={cn('h-5 w-5 flex-shrink-0', active && 'stroke-[2.4]')} />
        <span className="text-[10px] font-medium leading-tight truncate max-w-full">
          {t(item.mobileLabelKey)}
        </span>
      </button>
    );
  };

  const SheetItem = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = isItemActive(item.path);
    return (
      <button
        type="button"
        onClick={() => go(item.path)}
        className={cn(
          'flex h-14 items-center gap-3 rounded-xl border px-3 text-left transition-colors',
          active
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-border bg-card hover:bg-secondary/60 text-foreground'
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm font-medium truncate">{t(item.labelKey)}</span>
      </button>
    );
  };

  return (
    <>
      <div className="lg:hidden" aria-label={t('mobilemenu.time')}>
        <TimeTracker />
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t lg:hidden safe-area-bottom"
        role="navigation"
        aria-label="Menu principal mobile"
      >
        <div className="flex items-stretch gap-1 px-2 py-1">
          {mobileQuickItems.map((item) => (
            <QuickButton key={item.path} item={item} />
          ))}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t('mobilemenu.more')}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors min-w-0',
              open ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-tight">
              {t('mobilemenu.more')}
            </span>
          </button>
        </div>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl max-h-[85vh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        >
          <SheetHeader className="text-left">
            <SheetTitle>{t('mobilemenu.more')}</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-6">
            {navGroups.map((group) => (
              <section key={group.id}>
                <h3 className="px-1 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {t(group.labelKey)}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((item) => (
                    <SheetItem key={item.path} item={item} />
                  ))}
                </div>
              </section>
            ))}

            <section>
              <h3 className="px-1 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                {t('nav.group.account')}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <SheetItem item={accountItem} />
              </div>
            </section>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileMenu;
