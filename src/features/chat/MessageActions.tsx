import { Button } from "@/components/ui/button";
import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { memo, useCallback, useState } from "react";
import { toast } from "sonner";

type Props = { content: string };

function legacyCopy(text: string) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export const MessageActions = memo(function MessageActions({ content }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        const ok = legacyCopy(content);
        if (!ok) throw new Error("Legacy copy failed");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Copy failed. Please try again.");
    }
  }, [content]);

  return (
    <div className="relative inline-flex rounded-md border p-0.5 shadow-sm">
      <TooltipProvider delayDuration={0}>
        <TooltipRoot>
          <TooltipTrigger asChild>
            <Button
              variant="link"
              className="text-muted-foreground hover:text-foreground size-6 p-0 [&_svg]:size-4"
              onClick={handleCopy}
              aria-label="Copy message"
            >
              {copied ? <CheckIcon /> : <DocumentDuplicateIcon />}
              <span className="sr-only">Copy</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{copied ? "Copied!" : "Copy"}</p>
          </TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    </div>
  );
});
