import * as React from "react";
import {
  OTPInput,
  OTPInputContext,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "input-otp";
import { MinusIcon } from "lucide-react";

import { cn } from "@/core/utils/index";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Button } from "./button";
import { HorizontalLogo } from "@/core/config/svg";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

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
  children: React.ReactNode;
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

export function OtpModal({
  children,
  onRequestCode,
  onVerifyCode,
  title = "Confirm OTP",
  subtitle = "A 4 digit one time password has been sent to your WhatsApp.",
  autoCloseMs = 500,
}: OtpModalProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [requesting, setRequesting] = React.useState(false);
  const [hasGuessed, setHasGuessed] = React.useState<undefined | boolean>(
    undefined,
  );
  const [error, setError] = React.useState<string | null>(null);

  // focus input when modal opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // cleanup when closing
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

    // small UX nicety: select then blur after
    inputRef.current?.select();
    await new Promise((r) => setTimeout(r, 100));

    try {
      const ok = await onVerifyCode(value);
      setHasGuessed(ok);
      if (!ok) setError("Invalid code. Please try again.");
      setValue("");

      // blur to hide focus ring if success
      setTimeout(() => inputRef.current?.blur(), 20);

      if (ok) {
        // close shortly after success
        setTimeout(() => setOpen(false), autoCloseMs);
      }
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
      await onRequestCode();
      // reset UI so the user can try again
      setHasGuessed(undefined);
    } catch {
      setError("Couldn't resend code. Please try again.");
    } finally {
      setRequesting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          {/* optional brand header */}
          <DialogHeader>
            <HorizontalLogo className="mx-auto mb-5 w-30 border-b" />
            <DialogTitle className="sm:text-center">
              {hasGuessed ? "Code verified!" : title}
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              {hasGuessed
                ? "Your code has been successfully verified."
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
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="form-control" />
                  <InputOTPSlot index={1} className="form-control" />
                  <InputOTPSlot index={2} className="form-control" />
                  <InputOTPSlot index={3} className="form-control" />
                </InputOTPGroup>
              </InputOTP>

              <Button type="submit" disabled={value.length !== 4 || verifying}>
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
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
