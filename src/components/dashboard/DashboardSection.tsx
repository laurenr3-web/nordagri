
import React from 'react';
import { cn } from '@/lib/utils';
import { BlurContainer } from '@/components/ui/blur-container';

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ElementType;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
}

export function DashboardSection({
  title,
  subtitle,
  children,
  action,
  className,
  icon: Icon,
  variant = 'default'
}: DashboardSectionProps) {
  const variantClasses = {
    primary: "border-primary/20 bg-gradient-to-br from-primary-50/80 to-white/90",
    secondary: "border-harvest-200 bg-gradient-to-br from-harvest-50/80 to-white/90",
    accent: "border-agri-200 bg-gradient-to-br from-agri-50/80 to-white/90",
    default: ""
  };

  return (
    <section className={cn("mb-8", className)}>
      <BlurContainer 
        className={cn(
          "overflow-hidden",
          variantClasses[variant]
        )}
        raised={true}
        blurStrength="light"
        gradient={true}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {Icon && <Icon className={cn(
                "h-5 w-5", 
                variant === 'primary' ? "text-primary" : 
                variant === 'secondary' ? "text-harvest-600" : 
                variant === 'accent' ? "text-agri-600" : 
                "text-muted-foreground"
              )} />}
              <div>
                <h2 className="text-xl font-medium tracking-tight">{title}</h2>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {action && (
              <div>{action}</div>
            )}
          </div>
          <div className="transition-all duration-200">
            {children}
          </div>
        </div>
      </BlurContainer>
    </section>
  );
}
