import * as React from "react";

import { cn } from "@/core/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { KeyFilter, type KeyFilterType } from "./keyfilter";

const inputVariants = cva("form-control", {
  variants: {
    size: {
      sm: "h-8 text-sm",
      md: "h-10 text-base", // default
      lg: "h-12 text-lg",
    },
    state: {
      invalid: "ring-destructive/20 border-destructive",
      valid: "border-green-500 ring-green-200 ring-[3px]",
      default: "",
    },
    withStartIcon: {
      true: "ps-10 pe-4",
      false: "px-4",
    },
    withEndIcon: {
      true: "pe-10",
      false: "",
    },
  },
  compoundVariants: [
    {
      withStartIcon: false,
      withEndIcon: false,
      className: "px-4",
    },
  ],
  defaultVariants: {
    size: "md",
  },
});

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size" | "onInput">,
    VariantProps<typeof inputVariants> {
  startIcon?: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  endIcon?: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  startIconProps?: React.HTMLAttributes<SVGSVGElement> & { className?: string };
  endIconProps?: React.HTMLAttributes<SVGSVGElement> & { className?: string };
  className?: string;
  containerProps?: React.ComponentProps<"div">;
  keyfilter?: KeyFilterType;
  invalid?: boolean;
  valid?: boolean;
  validateOnly?: boolean;
  onInput?: (
    event: React.FormEvent<HTMLInputElement>,
    isValid: boolean,
  ) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      startIcon,
      endIcon,
      startIconProps,
      endIconProps,
      containerProps,
      state,
      size,
      keyfilter,
      invalid = false,
      valid = false,
      validateOnly = false,
      onInput,
      disabled,
      ...props
    }: InputProps,
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const { className: containerClassName, ...rest } = containerProps ?? {};
    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (keyfilter) {
        KeyFilter.onKeyPress(event, keyfilter, validateOnly);
      }
    };

    const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
      let isValid = true;
      if (keyfilter && validateOnly) {
        isValid = KeyFilter.validate(event, keyfilter);
      }
      onInput?.(event, isValid);
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
      if (keyfilter) {
        KeyFilter.onPaste(event, keyfilter, validateOnly);
      }
    };

    const inputElement = (
      <input
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        data-slot="input"
        className={cn(
          inputVariants({
            size,
            withStartIcon: !!startIcon,
            withEndIcon: !!endIcon,
            state: (state ?? invalid) ? "invalid" : valid ? "valid" : "default",
            className,
          }),
        )}
        onKeyDown={onKeyDown}
        onInput={handleInput}
        onPaste={handlePaste}
        aria-invalid={invalid}
        disabled={disabled}
        {...props}
      />
    );

    // If no icons, return just the input
    if (!startIcon && !endIcon) {
      return inputElement;
    }

    // Return wrapped input with icons
    return (
      <div
        className={cn(
          "relative flex items-center [&_svg]:size-5",
          disabled && "[&_svg]:opacity-70",
          containerClassName,
        )}
        {...rest}
      >
        {startIcon && (
          <InputIcon icon={startIcon} position="left" {...startIconProps} />
        )}

        {inputElement}

        {endIcon && (
          <InputIcon icon={endIcon} position="right" {...endIconProps} />
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export interface InputIconProps extends React.HTMLAttributes<SVGSVGElement> {
  // icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  icon:
    | React.ReactElement<React.SVGProps<SVGSVGElement>>
    | React.ComponentProps<"div">;
  position: "left" | "right";
}

export function InputIcon({
  icon,
  position,
  className,
  ...rest
}: InputIconProps) {
  if (!React.isValidElement(icon)) return null;

  return React.cloneElement(icon, {
    ...rest,
    className: cn(
      "pointer-events-none1 absolute mx-3 flex h-full items-center text-muted-foreground",
      position === "left" ? "left-0" : "right-0",
      className,
      icon.props.className,
    ),
  });
}

export { Input, inputVariants };

// Usage Examples with SVG icons:
//
// With start icon (SVG):
// <Input
//   startIcon={<svg>...</svg>}
//   placeholder="Enter your mail"
// />
//
// With Lucide React icons:
// <Input
//   startIcon={<Mail className="text-blue-500" />}
//   placeholder="Enter your mail"
// />
//
// With end icon and custom props:
// <Input
//   endIcon={<EyeIcon />}
//   endIconProps={{
//     onClick: () => togglePassword(),
//     className: "cursor-pointer hover:text-foreground"
//   }}
//   placeholder="Enter password"
// />
//
// With both icons and custom styling:
// <Input
//   startIcon={<MailIcon />}
//   startIconProps={{ className: "text-blue-500" }}
//   endIcon={<SearchIcon />}
//   endIconProps={{
//     onClick: handleSearch,
//     className: "cursor-pointer"
//   }}
//   placeholder="Search emails"
// />
//
// Without icons (returns clean <input /> element):
// <Input placeholder="Regular input" />
