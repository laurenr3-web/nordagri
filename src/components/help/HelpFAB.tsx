import { HelpCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useHelpCenter } from '@/contexts/HelpCenterContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { cn } from '@/lib/utils';

const PUBLIC_ROUTES = ['/auth', '/auth/callback', '/accept-invitation', '/legal', '/pricing', '/unsubscribe'];

export const HelpFAB = () => {
  const { open, isOpen } = useHelpCenter();
  const { isOnboardingActive } = useOnboarding();
  const location = useLocation();

  // Hide on public routes
  if (PUBLIC_ROUTES.some((r) => location.pathname.startsWith(r))) return null;

  // Hide during a Joyride tour to avoid visual conflicts
  if (isOnboardingActive) return null;

  // Hide when the help drawer itself is open
  if (isOpen) return null;

  return (
    <button
      type="button"
      onClick={() => open()}
      aria-label="Ouvrir le centre d'aide"
      title="Centre d'aide"
      className={cn(
        'fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[60]',
        'w-12 h-12 sm:w-14 sm:h-14 rounded-full',
        'bg-primary text-primary-foreground',
        'shadow-lg hover:shadow-xl',
        'flex items-center justify-center',
        'transition-all hover:scale-105',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
    >
      <HelpCircle className="h-6 w-6" />
    </button>
  );
};

export default HelpFAB;