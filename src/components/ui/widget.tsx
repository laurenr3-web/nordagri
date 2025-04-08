
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
}: WidgetProps) {
  const content = (
    <Card 
      className={cn(
        widgetStyles.container, 
        animate && animations.fadeIn, 
        transitions.default, 
        className
      )}
      style={delay ? { animationDelay: `${delay * 0.1}s` } as React.CSSProperties : undefined}
    >
      {(title || subtitle || Icon || action) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
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
      <CardContent className={cn("pt-3", contentClassName)}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-agri-primary" />
          </div>
        ) : (
          children
        )}
      </CardContent>
      {footer && <CardFooter className="border-t p-3">{footer}</CardFooter>}
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
