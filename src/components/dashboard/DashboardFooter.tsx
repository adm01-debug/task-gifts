import { memo } from "react";
import { DASHBOARD_TEXTS } from "@/constants/texts";

/**
 * DashboardFooter - Footer component for the main dashboard
 * Extracted for reusability and maintainability
 */
export const DashboardFooter = memo(function DashboardFooter() {
  return (
    <footer 
      className="px-4 md:px-6 py-4 border-t border-border text-center"
      role="contentinfo"
      aria-label="Rodapé do dashboard"
    >
      <p className="text-sm text-muted-foreground">
        {DASHBOARD_TEXTS.footer.madeWith}{" "}
        <span className="text-primary" aria-hidden="true">♥</span>{" "}
        {DASHBOARD_TEXTS.footer.by} •
        <span className="gradient-text font-semibold ml-1">
          {DASHBOARD_TEXTS.footer.tagline}
        </span>
      </p>
    </footer>
  );
});
