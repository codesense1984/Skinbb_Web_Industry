import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/core/utils/index";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-muted-foreground flex items-center gap-2 leading-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        // "group-data-[disabled=true]:pointer-events-none ",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
