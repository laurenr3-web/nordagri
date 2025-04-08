
import * as React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { widgetStyles, animations, transitions } from "@/lib/design-system";

interface WidgetProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ElementType;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  contentClassName?: string;
  animate?: boolean;
  delay?: number;
  tooltip?: string;
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'accent' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Widget({
  title,
  subtitle,
  icon: Icon,
  action,
  footer,
  isLoading = false,
  className,
  contentClassName,
  animate = true,
  delay = 0,
  tooltip,
  children,
  variant = 'default',
  size = 'md',
}: WidgetProps) {
  const variantClasses = React.useMemo(() => {
    switch (variant) {
      case 'outline':
        return "border-2 bg-white/70";
      case 'accent':
        return "border border-agri-200 bg-gradient-to-br from-agri-50 to-white shadow-sm";
      case 'primary':
        return "border-primary/20 bg-gradient-to-br from-primary-50 to-white shadow-sm";
      case 'secondary':
        return "border-harvest-200 bg-gradient-to-br from-harvest-50 to-white shadow-sm";
      default:
        return "border bg-card/80";
    }
  }, [variant]);

  const sizeClasses = React.useMemo(() => {
    switch (size) {
      case 'sm':
        return "p-3";
      case 'lg':
        return "p-6";
      default:
        return "p-4";
    }
  }, [size]);

  const content = (
    <Card 
      className={cn(
        widgetStyles.container, 
        variantClasses,
        animate && animations.fadeIn, 
        transitions.default, 
        className
      )}
      style={delay ? { animationDelay: `${delay * 0.1}s` } as React.CSSProperties : undefined}
    >
      {(title || subtitle || Icon || action) && (
        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-3", size === 'sm' ? 'p-3' : '')}>
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="h-5 w-5 text-agri-primary" />}
            <div>
              {title && <CardTitle className="text-base font-medium">{title}</CardTitle>}
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("pt-3", size === 'sm' ? 'p-3' : '', contentClassName)}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-agri-primary" />
          </div>
        ) : (
          children
        )}
      </CardContent>
      {footer && <CardFooter className={cn("border-t", size === 'sm' ? 'p-3' : '')}>{footer}</CardFooter>}
    </Card>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
