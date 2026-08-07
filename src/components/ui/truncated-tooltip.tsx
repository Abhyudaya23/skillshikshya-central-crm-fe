import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TruncatedTooltipProps {
  text: string;
  className?: string;
  maxWidth?: string;
}

/** Truncates long text and shows the full value in a hover tooltip. */
export function TruncatedTooltip({
  text,
  className,
  maxWidth = "16rem",
}: TruncatedTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "block cursor-default truncate text-left",
            className,
          )}
          style={{ maxWidth }}
        >
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" align="start" className="max-w-sm whitespace-normal text-left">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
