
import * as React from 'react';
import { cn } from '@/lib/utils';
import { transitions, animations } from '@/lib/design-system';

interface BlurContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  blurStrength?: 'none' | 'light' | 'medium' | 'strong';
}

export function BlurContainer({
  children,
  className,
  delay = 0,
  blurStrength = 'light',
  ...props
}: BlurContainerProps) {
  const blurClass = React.useMemo(() => {
    switch (blurStrength) {
      case 'none':
        return '';
      case 'light':
        return 'backdrop-blur-sm';
      case 'medium':
        return 'backdrop-blur-md';
      case 'strong':
        return 'backdrop-blur-lg';
      default:
        return 'backdrop-blur-sm';
    }
  }, [blurStrength]);
  
  return (
    <div
      className={cn(
        "rounded-lg border bg-white/80",
        blurClass,
        transitions.default,
        animations.fadeIn,
        className
      )}
      style={delay ? { animationDelay: `${delay * 0.1}s` } as React.CSSProperties : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

interface StaticBlurContainerProps extends BlurContainerProps {
  animate?: boolean;
}

export function StaticBlurContainer({
  animate = false,
  ...props
}: StaticBlurContainerProps) {
  return <BlurContainer {...props} className={cn(props.className, !animate && "!animate-none")} />;
}
