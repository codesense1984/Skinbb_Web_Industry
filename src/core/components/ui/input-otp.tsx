import {
  OTPInput,
  OTPInputContext,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "input-otp";
import { MinusIcon } from "lucide-react";
import * as React from "react";

import { HorizontalLogo } from "@/core/config/svg";
import { cn } from "@/core/utils/index";
import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

const InputOTP = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof OTPInput> & {
    containerClassName?: string;
  }
>(function InputOTP({ className, containerClassName, ...props }, ref) {
  return (
    <OTPInput
      ref={ref}
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
});

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:border-primary data-[active=true]:ring-primary/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-10 w-10 items-center justify-center border-y border-r shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

type OtpModalProps = {
  /** Trigger button (wrapped via <DialogTrigger>) */
  children?: React.ReactNode;
  /** Called when user taps "Resend code" (and also by your opener if you want) */
  onRequestCode: () => Promise<void>;

  /** Return true if code is valid; false otherwise */
  onVerifyCode: (code: string) => Promise<boolean>;

  /** Optional UI text */
  title?: string;
  subtitle?: string;

  /** Optional: auto close delay (ms) after success */
  autoCloseMs?: number;
};

// Add ref type for imperative handle
export interface OtpModalRef {
  setOpen: (open: boolean) => Promise<void>;
}

export const OtpModal = React.forwardRef<OtpModalRef, OtpModalProps>(
  (
    {
      children,
      onRequestCode,
      onVerifyCode,
      title = "Confirm OTP",
      subtitle = "A 4 digit one time password has been sent to your WhatsApp.",
      autoCloseMs = 1000,
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const closeButtonRef = React.useRef<HTMLButtonElement>(null);

    const [internalOpen, setInternalOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [verifying, setVerifying] = React.useState(false);
    const [requesting, setRequesting] = React.useState(false);
    const [hasGuessed, setHasGuessed] = React.useState<undefined | boolean>(
      undefined,
    );
    const [error, setError] = React.useState<string | null>(null);

    // Use internal state since we're controlling via ref
    const open = internalOpen;

    // Create a wrapper that handles OTP sending before opening
    const wrappedSetOpen = React.useCallback(
      async (newOpen: boolean) => {
        if (newOpen) {
          // Send OTP first when opening
          if (requesting) return;
          setRequesting(true);
          setError(null);
          try {
            await onRequestCode?.();
            // Open modal after successful OTP sending
            setInternalOpen(newOpen);
          } catch {
            setError("Couldn't send code. Please try again.");
          } finally {
            setRequesting(false);
          }
        } else {
          // Handle closing
          setInternalOpen(newOpen);
        }
      },
      [requesting, onRequestCode],
    );

    // Expose the wrapped function to the parent component
    React.useImperativeHandle(
      ref,
      () => ({
        setOpen: wrappedSetOpen,
      }),
      [wrappedSetOpen],
    );

    const finalSetOpen = wrappedSetOpen;

    React.useEffect(() => {
      if (open) {
        // Focus input when modal opens
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        setValue("");
        setHasGuessed(undefined);
        setError(null);
        setVerifying(false);
        setRequesting(false);
      }
    }, [open]);

    async function handleVerify() {
      if (value.length < 4 || verifying) return;
      setVerifying(true);
      setError(null);

      inputRef.current?.select();
      await new Promise((r) => setTimeout(r, 100));

      try {
        const ok = await onVerifyCode(value); // must resolve to boolean
        setHasGuessed(ok);
        if (!ok) setError("Invalid code. Please try again.");
        setValue("");
        setTimeout(() => inputRef.current?.blur(), 20);
        if (ok) setTimeout(() => finalSetOpen(false), autoCloseMs);
      } catch {
        setError("Something went wrong. Please try again.");
        setHasGuessed(false);
      } finally {
        setVerifying(false);
      }
    }

    async function handleResend() {
      if (requesting) return;
      setRequesting(true);
      setError(null);
      try {
        await onRequestCode?.();
        setHasGuessed(undefined);
      } catch {
        setError("Couldn't resend code. Please try again.");
      } finally {
        setRequesting(false);
      }
    }

    // ✅ Enhance every child with proper accessibility attributes (only if children are provided)
    const enhancedChildren = children
      ? React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;

          return React.cloneElement(
            child as React.ReactElement<Record<string, unknown>>,
            {
              // a11y
              "aria-haspopup": "dialog",
              "aria-expanded": open,
              "aria-controls": "otp-dialog",
              disabled:
                requesting ||
                (child.props as Record<string, unknown>)?.disabled,
            },
          );
        })
      : null;

    return (
      <>
        {enhancedChildren}
        <Dialog open={open} onOpenChange={finalSetOpen}>
          <DialogContent id="otp-dialog">
            <div className="flex flex-col items-center gap-2">
              <DialogHeader>
                <HorizontalLogo className="mx-auto mb-5 w-30 border-b" />
                <DialogTitle className="sm:text-center">
                  {hasGuessed ? "Code verified!" : title}
                </DialogTitle>
                <DialogDescription className="sm:text-center">
                  {hasGuessed
                    ? "Your code has been successfully verified."
                    : requesting
                      ? "Sending your code..."
                      : subtitle}
                </DialogDescription>
              </DialogHeader>
            </div>

            {hasGuessed ? (
              <div className="text-center">
                <DialogClose asChild>
                  <Button type="button" ref={closeButtonRef}>
                    Close
                  </Button>
                </DialogClose>
              </div>
            ) : (
              <div className="space-y-4">
                <form
                  className="flex flex-col items-center gap-4"
                  onSubmit={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleVerify();
                  }}
                >
                  <InputOTP
                    id="confirmation-code"
                    ref={inputRef}
                    value={value}
                    onChange={setValue}
                    maxLength={4}
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    onFocus={() => {
                      setHasGuessed(undefined);
                      setError(null);
                    }}
                    disabled={requesting}
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="form-control" />
                      <InputOTPSlot index={1} className="form-control" />
                      <InputOTPSlot index={2} className="form-control" />
                      <InputOTPSlot index={3} className="form-control" />
                    </InputOTPGroup>
                  </InputOTP>

                  <Button
                    type="submit"
                    disabled={value.length !== 4 || verifying || requesting}
                  >
                    {verifying ? "Verifying..." : "Verify"}
                  </Button>
                </form>

                {error && (
                  <p
                    className="text-muted-foreground text-center text-xs"
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </p>
                )}

                <p className="text-center text-sm">
                  Didn&apos;t receive code?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="underline hover:no-underline"
                    onClick={handleResend}
                    disabled={requesting}
                  >
                    {requesting ? "Resending..." : "Resend code"}
                  </Button>
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

OtpModal.displayName = "OtpModal";

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
