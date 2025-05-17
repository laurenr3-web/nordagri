
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

// BentoGrid Component
// ===================

const bentoGridVariants = cva(
  "grid gap-4 grid-cols-1",
  {
    variants: {
      size: {
        default: "md:grid-cols-3",
        sm: "md:grid-cols-2",
        lg: "md:grid-cols-4",
      },
      gap: {
        default: "gap-4",
        sm: "gap-2",
        lg: "gap-6",
      }
    },
    defaultVariants: {
      size: "default",
      gap: "default",
    },
  }
);

export interface BentoGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bentoGridVariants> {}

export function BentoGrid({ className, size, gap, ...props }: BentoGridProps) {
  return (
    <div 
      className={cn(bentoGridVariants({ size, gap }), className)}
      {...props}
    />
  );
}

// BentoCard Component
// ==================

const bentoCardVariants = cva(
  "relative overflow-hidden rounded-lg border flex flex-col transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground shadow-sm",
        primary: "border-primary/20 bg-primary/5 text-primary-foreground shadow-sm",
        accent: "border-accent/20 bg-accent/5 text-accent-foreground shadow-sm",
        glass: "bg-white/70 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-glass",
      },
      size: {
        default: "col-span-1 md:col-span-1",
        sm: "col-span-1",
        md: "col-span-1 md:col-span-2",
        lg: "col-span-1 md:col-span-3",
        xl: "col-span-1 md:col-span-3 lg:col-span-4",
        full: "col-span-1 md:col-span-full",
      },
      height: {
        default: "h-auto min-h-[12rem]",
        sm: "h-auto min-h-[8rem]",
        md: "h-auto min-h-[16rem]",
        lg: "h-auto min-h-[24rem]",
        auto: "h-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      height: "default",
    },
  }
);

export interface BentoCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bentoCardVariants> {
  asChild?: boolean;
  backgroundUrl?: string;
}

export const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, variant, size, height, asChild = false, backgroundUrl, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        className={cn(bentoCardVariants({ variant, size, height }), 
          "group hover:shadow-hover", 
          className
        )}
        ref={ref}
        {...props}
      >
        {backgroundUrl && (
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
          />
        )}
        <div className="relative z-10 flex flex-col h-full p-4 md:p-6">{children}</div>
      </Comp>
    );
  }
);
BentoCard.displayName = "BentoCard";

// BentoCardHeader Component
// ========================

export function BentoCardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5", className)} {...props} />;
}
BentoCardHeader.displayName = "BentoCardHeader";

// BentoCardIcon Component
// =====================

export function BentoCardIcon({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/15", className)} 
      {...props} 
    />
  );
}
BentoCardIcon.displayName = "BentoCardIcon";

// BentoCardTitle Component
// ======================

export function BentoCardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-xl font-semibold tracking-tight", className)} {...props} />;
}
BentoCardTitle.displayName = "BentoCardTitle";

// BentoCardDescription Component
// ============================

export function BentoCardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
BentoCardDescription.displayName = "BentoCardDescription";

// BentoCardContent Component
// ========================

export function BentoCardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pt-3 flex-1", className)} {...props} />;
}
BentoCardContent.displayName = "BentoCardContent";

// BentoCardFooter Component
// =======================

export function BentoCardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("flex items-center pt-4 mt-auto", className)}
      {...props}
    />
  );
}
BentoCardFooter.displayName = "BentoCardFooter";
