import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/core/utils/index";

function AvatarRoot({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}

// Enhanced Avatar component with additional props
interface EnhancedAvatarProps {
  src?: string;
  alt?: string;
  feedback?: string | React.ReactNode;
  feedbackProps?: React.HTMLAttributes<HTMLDivElement>;
  srcProps?: React.ComponentProps<typeof AvatarPrimitive.Image>;
  fallbackProps?: React.ComponentProps<typeof AvatarPrimitive.Fallback>;
  className?: string;
  children?: React.ReactNode;
}

function Avatar({
  src,
  alt,
  feedback,
  feedbackProps,
  srcProps,
  fallbackProps,
  className,
  children,
  ...props
}: EnhancedAvatarProps & React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarRoot className={className} {...props}>
      {src && <AvatarImage src={src} alt={alt} {...srcProps} />}
      <AvatarFallback {...fallbackProps}>{feedback}</AvatarFallback>
    </AvatarRoot>
  );
}

export { AvatarRoot, AvatarImage, AvatarFallback, Avatar };
