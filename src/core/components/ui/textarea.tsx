import * as React from "react";

import { cn } from "@/core/utils/index";
import type { InputProps } from "./input";

type IconProps = Pick<
  InputProps,
  "startIcon" | "endIcon" | "startIconProps" | "endIconProps"
>;

export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    IconProps {}

function Textarea({
  className,
  startIcon,
  startIconProps,
  endIcon,
  endIconProps,
  ...props
}: TextareaProps) {
  const inputElement = (
    <textarea
      data-slot="textarea"
      className={cn(
        "form-control h-full min-h-10",
        // Dynamic padding based on icons
        startIcon ? "pl-10" : "px-4",
        endIcon ? "pr-10" : startIcon ? "" : "px-4",
        className,
      )}
      {...props}
    />
  );

  // If no icons, return just the input
  if (!startIcon && !endIcon) {
    return inputElement;
  }

  // Return wrapped input with icons
  return (
    <div className="relative flex">
      {startIcon && React.isValidElement(startIcon)
        ? React.cloneElement(startIcon, {
            ...startIconProps,
            className: cn(
              "text-muted-foreground pointer-events-none absolute left-0 mx-3 my-3 flex h-full items-center size-5",
              startIconProps?.className,
              startIcon.props.className,
            ),
          })
        : startIcon}

      {inputElement}

      {endIcon && React.isValidElement(endIcon)
        ? React.cloneElement(endIcon, {
            ...endIconProps,
            className: cn(
              "text-muted-foreground pointer-events-none absolute right-0 mx-3 my-3 flex h-full items-center size-5",
              endIconProps?.className,
              endIcon.props.className,
            ),
          })
        : endIcon}
    </div>
  );
}

export { Textarea };
