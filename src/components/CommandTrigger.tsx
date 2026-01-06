import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { memo } from "react";

interface CommandTriggerProps {
  className?: string;
}

export const CommandTrigger = memo(function CommandTrigger({ className }: CommandTriggerProps) {
  const handleClick = () => {
    // Dispatch keyboard event to open command palette
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={className}
    >
      <Search className="w-4 h-4 mr-2" />
      <span className="hidden sm:inline">Buscar...</span>
      <kbd className="ml-2 hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
});
