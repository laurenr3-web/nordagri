
import * as React from "react";
import { cn } from "@/lib/utils";

interface BlurContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  intensity?: "none" | "light" | "medium" | "strong";
}

export const BlurContainer = React.forwardRef<HTMLDivElement, BlurContainerProps>(
  ({ className, children, intensity = "medium", ...props }, ref) => {
    // Define blur intensities
    const blurIntensities = {
      none: "",
      light: "bg-background/80 backdrop-blur-sm",
      medium: "bg-background/70 backdrop-blur-md",
      strong: "bg-background/60 backdrop-blur-lg",
    };

    const blurClass = blurIntensities[intensity];
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border shadow-sm",
          blurClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BlurContainer.displayName = "BlurContainer";
