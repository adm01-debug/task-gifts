import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "lg";
}

const SectionDivider = React.forwardRef<HTMLDivElement, SectionDividerProps>(
  ({ className, size = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        size === "lg" ? "section-divider-lg" : "section-divider",
        className
      )}
      {...props}
    />
  )
);
SectionDivider.displayName = "SectionDivider";

export { SectionDivider };
