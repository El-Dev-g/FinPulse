import { PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  isCollapsed,
}: {
  className?: string;
  isCollapsed?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 font-bold text-primary",
        className
      )}
    >
      <div className={cn("bg-primary-foreground/10 p-2 rounded-lg", className ? "bg-primary-foreground/20" : "")}>
        <PiggyBank
          className={cn(`h-6 w-6 transition-all duration-300`, className ? "text-primary-foreground" : "text-primary")}
        />
      </div>
      {!isCollapsed && (
        <span className="text-xl font-headline font-semibold tracking-tight">
          FinPulse
        </span>
      )}
    </div>
  );
}
