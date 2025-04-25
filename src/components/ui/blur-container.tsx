
import * as React from "react";
import { cn } from "@/lib/utils";

interface BlurContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "light" | "medium" | "heavy";
  glassFill?: boolean;
  neoMorphic?: boolean;
  raised?: boolean;
}

export function BlurContainer({
  children,
  className,
  intensity = "medium",
  glassFill = true,
  neoMorphic = false,
  raised = false,
  ...props
}: BlurContainerProps) {
  const blurValue = {
    light: "backdrop-blur-sm",
    medium: "backdrop-blur-md",
    heavy: "backdrop-blur-lg",
  }[intensity];
  
  const bgOpacity = {
    light: "bg-white/30 dark:bg-black/20",
    medium: "bg-white/50 dark:bg-black/30",
    heavy: "bg-white/70 dark:bg-black/40",
  }[intensity];
  
  const glassStyles = cn(
    "relative rounded-xl border w-full",
    bgOpacity,
    blurValue,
    glassFill ? "border-white/20 dark:border-white/10" : "border-transparent",
    raised ? "shadow-elevated" : "shadow-glass"
  );
  
  const neoStyles = cn("neo w-full");

  return (
    <div
      className={cn(
        neoMorphic ? neoStyles : glassStyles,
        "flex flex-col",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
