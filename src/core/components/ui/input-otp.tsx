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

type EmailOtpModalProps = {
  /** Trigger button (wrapped via <DialogTrigger>) */
  children?: React.ReactNode;
  /** Called when user taps "Resend code" (and also by your opener if you want) */
  onRequestCode: () => Promise<void>;

  /** Return true if code is valid; false otherwise */
  onVerifyCode: (code: string) => Promise<boolean>;

  /** Optional UI text */
  title?: string;
  subtitle?: string;
};

// Add ref type for imperative handle
export interface OtpModalRef {
  setOpen: (open: boolean) => Promise<void>;
}

export const EmailOtpModal = React.forwardRef<OtpModalRef, EmailOtpModalProps>(
  (
    {
      children,
      onRequestCode,
      onVerifyCode,
      title = "Confirm OTP",
      subtitle = "A 4 digit one time password has been sent to your email.",
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const closeButtonRef = React.useRef<HTMLButtonElement>(null);

    const [internalOpen, setInternalOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [verifying, setVerifying] = React.useState(false);
    const [requesting, setRequesting] = React.useState(false);
    const [hasGuessed, setHasGuessed] = React.useState<boolean | undefined>(
      undefined,
    );
    const [error, setError] = React.useState<string | null>(null);

    const open = internalOpen;
    const OTP_LENGTH = 4;
    const FOCUS_DELAY = 100;
    const BLUR_DELAY = 20;

    // Reset all state when modal closes
    const resetState = React.useCallback(() => {
      setValue("");
      setHasGuessed(undefined);
      setError(null);
      setVerifying(false);
      setRequesting(false);
    }, []);

    // Handle verification error - clear OTP and refocus input
    const handleVerificationError = React.useCallback(
      (errorMessage: string) => {
        setError(errorMessage);
        setValue("");
        setHasGuessed(false);
        setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY);
      },
      [],
    );

    // Handle successful verification
    const handleVerificationSuccess = React.useCallback(() => {
      setError(null);
      setValue("");
      setTimeout(() => inputRef.current?.blur(), BLUR_DELAY);
      // Modal stays open - user must manually close it
    }, []);

    // Verify OTP code
    const handleVerify = React.useCallback(async () => {
      if (value.length < OTP_LENGTH || verifying) return;

      setVerifying(true);
      inputRef.current?.select();
      await new Promise((r) => setTimeout(r, FOCUS_DELAY));

      try {
        const isValid = await onVerifyCode(value);
        setHasGuessed(isValid);

        if (isValid) {
          handleVerificationSuccess();
        } else {
          handleVerificationError("Invalid code. Please try again.");
        }
      } catch {
        handleVerificationError("Something went wrong. Please try again.");
      } finally {
        setVerifying(false);
      }
    }, [
      value,
      verifying,
      onVerifyCode,
      handleVerificationError,
      handleVerificationSuccess,
    ]);

    // Request OTP code
    const requestCode = React.useCallback(async () => {
      if (requesting) return;

      setRequesting(true);
      setError(null);

      try {
        await onRequestCode?.();
        return true;
      } catch {
        setError("Couldn't send code. Please try again.");
        return false;
      } finally {
        setRequesting(false);
      }
    }, [requesting, onRequestCode]);

    // Handle resend OTP
    const handleResend = React.useCallback(async () => {
      const success = await requestCode();
      if (success) {
        setHasGuessed(undefined);
      }
    }, [requestCode]);

    // Handle modal open/close
    const wrappedSetOpen = React.useCallback(
      async (newOpen: boolean) => {
        if (newOpen) {
          const success = await requestCode();
          if (success) {
            setInternalOpen(true);
          }
        } else {
          setInternalOpen(false);
        }
      },
      [requestCode],
    );

    // Expose setOpen method via ref
    React.useImperativeHandle(ref, () => ({ setOpen: wrappedSetOpen }), [
      wrappedSetOpen,
    ]);

    // Handle modal open/close effects
    React.useEffect(() => {
      if (open) {
        setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY);
      } else {
        resetState();
      }
    }, [open, resetState]);

    // Auto-verify when 4 digits are entered
    React.useEffect(() => {
      if (
        value.length === OTP_LENGTH &&
        !verifying &&
        !requesting &&
        !hasGuessed
      ) {
        handleVerify();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Enhance children with accessibility attributes
    const enhancedChildren = React.useMemo(() => {
      if (!children) return null;

      return React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        return React.cloneElement(
          child as React.ReactElement<Record<string, unknown>>,
          {
            "aria-haspopup": "dialog",
            "aria-expanded": open,
            "aria-controls": "otp-dialog",
            disabled:
              requesting || (child.props as Record<string, unknown>)?.disabled,
          },
        );
      });
    }, [children, open, requesting]);

    const dialogSubtitle = hasGuessed
      ? "Your code has been successfully verified."
      : requesting
        ? "Sending your code..."
        : subtitle;

    return (
      <>
        {enhancedChildren}
        <Dialog open={open} onOpenChange={wrappedSetOpen}>
          <DialogContent id="otp-dialog">
            <div className="flex flex-col items-center gap-2">
              <DialogHeader>
                <HorizontalLogo className="mx-auto mb-5 w-30 border-b" />
                <DialogTitle className="sm:text-center">
                  {hasGuessed ? "Code verified!" : title}
                </DialogTitle>
                <DialogDescription className="sm:text-center">
                  {dialogSubtitle}
                </DialogDescription>
              </DialogHeader>
            </div>

            {hasGuessed ? (
              <div className="text-center">
                <DialogClose asChild>
                  <Button
                    type="button"
                    color={"secondary"}
                    variant={"contained"}
                    ref={closeButtonRef}
                  >
                    Close
                  </Button>
                </DialogClose>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <InputOTP
                    id="confirmation-code"
                    ref={inputRef}
                    value={value}
                    onChange={setValue}
                    maxLength={OTP_LENGTH}
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    onFocus={() => setHasGuessed(undefined)}
                    disabled={requesting || verifying}
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="form-control"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

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

EmailOtpModal.displayName = "EmailOtpModal";

// Phone OTP Modal with WhatsApp/SMS selection
type PhoneOtpModalProps = {
  /** Trigger button (wrapped via <DialogTrigger>) */
  children?: React.ReactNode;
  /** Called when user taps "Resend code" (and also by your opener if you want) */
  onRequestCode: (sendVia: "whatsapp" | "sms") => Promise<void>;

  /** Return true if code is valid; false otherwise */
  onVerifyCode: (code: string) => Promise<boolean>;

  /** Optional UI text */
  title?: string;
  subtitle?: string;
};

export const PhoneOtpModal = React.forwardRef<OtpModalRef, PhoneOtpModalProps>(
  (
    { children, onRequestCode, onVerifyCode, title = "Confirm OTP", subtitle },
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
    const [sendVia, setSendVia] = React.useState<"whatsapp" | "sms">(
      "whatsapp",
    );

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
            await onRequestCode?.(sendVia);
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
      [requesting, onRequestCode, sendVia],
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

    // Auto-verify when 4 digits are entered
    React.useEffect(() => {
      if (value.length === 4 && !verifying && !requesting && !hasGuessed) {
        handleVerify();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    async function handleVerify() {
      if (value.length < 4 || verifying) return;
      setVerifying(true);
      // Don't clear error here - let it persist until success

      inputRef.current?.select();
      await new Promise((r) => setTimeout(r, 100));

      try {
        const ok = await onVerifyCode(value); // must resolve to boolean
        setHasGuessed(ok);
        if (!ok) {
          setError("Invalid code. Please try again.");
          setValue(""); // Clear OTP on error
          // Re-enable input and refocus after error
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        } else {
          setError(null); // Clear error on success
          setValue("");
          setTimeout(() => inputRef.current?.blur(), 20);
          // Modal stays open - user must manually close it
        }
      } catch {
        setError("Something went wrong. Please try again.");
        setHasGuessed(false);
        setValue(""); // Clear OTP on error
        // Re-enable input and refocus after error
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      } finally {
        setVerifying(false);
      }
    }

    // Request OTP code with specific method
    const requestCodeWithMethod = React.useCallback(
      async (method: "whatsapp" | "sms") => {
        if (requesting) return;

        setRequesting(true);
        setError(null);
        setValue(""); // Clear OTP when switching methods
        setHasGuessed(undefined);

        try {
          await onRequestCode?.(method);
        } catch {
          setError("Couldn't send code. Please try again.");
        } finally {
          setRequesting(false);
        }
      },
      [requesting, onRequestCode],
    );

    // Handle switching between WhatsApp and SMS
    const handleMethodChange = React.useCallback(
      (method: "whatsapp" | "sms") => {
        if (requesting || verifying || sendVia === method) return;
        setSendVia(method);
        requestCodeWithMethod(method);
      },
      [requesting, verifying, sendVia, requestCodeWithMethod],
    );

    async function handleResend() {
      await requestCodeWithMethod(sendVia);
    }

    const getSubtitle = () => {
      if (hasGuessed) return "Your code has been successfully verified.";
      if (requesting) return "Sending your code...";
      if (subtitle) return subtitle;
      return `A 4 digit one time password has been sent to your ${sendVia === "whatsapp" ? "WhatsApp" : "SMS"}.`;
    };

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
              "aria-controls": "phone-otp-dialog",
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
          <DialogContent id="phone-otp-dialog" className="space-y-3">
            <div className="flex flex-col items-center gap-2">
              <DialogHeader>
                <HorizontalLogo className="mx-auto mb-5 w-30 border-b" />
                <DialogTitle className="sm:text-center">
                  {hasGuessed ? "Code verified!" : title}
                </DialogTitle>
                <DialogDescription className="sm:text-center">
                  {getSubtitle()}
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
              <>
                {/* WhatsApp/SMS Selection */}

                <div className="flex flex-col items-center gap-4">
                  <InputOTP
                    id="confirmation-code"
                    ref={inputRef}
                    value={value}
                    onChange={setValue}
                    maxLength={4}
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    onFocus={() => {
                      setHasGuessed(undefined);
                      // Don't clear error on focus - let it persist until success
                    }}
                    disabled={requesting || verifying}
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="form-control" />
                      <InputOTPSlot index={1} className="form-control" />
                      <InputOTPSlot index={2} className="form-control" />
                      <InputOTPSlot index={3} className="form-control" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <p
                    className="text-muted-foreground text-destructive text-center text-sm"
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </p>
                )}

                <p className="text-center text-sm">
                  Didn&apos;t receive code?
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto px-1 text-sm underline hover:no-underline"
                    onClick={handleResend}
                    disabled={requesting}
                  >
                    {requesting ? "Resending..." : "Resend code"}
                  </Button>
                  or try with{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto px-1 text-sm underline hover:no-underline"
                    onClick={() =>
                      handleMethodChange(
                        sendVia === "whatsapp" ? "sms" : "whatsapp",
                      )
                    }
                    disabled={requesting || verifying}
                  >
                    {sendVia === "whatsapp" ? "SMS" : "WhatsApp"}
                  </Button>
                </p>
              </>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

PhoneOtpModal.displayName = "PhoneOtpModal";

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
