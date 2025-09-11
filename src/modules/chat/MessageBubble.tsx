import React, { memo } from "react";
import logo from "@/core/assets/images/logo-icon.png";
import { cn } from "@/core/utils";
import { MarkdownMessage } from "@/core/components/ui/markdown";
import { MessageActions } from "./MessageActions";

type Props = {
  isUser?: boolean;
  loading?: boolean;
  userProfile?: string;
  children: React.ReactNode;
};

export const MessageBubble = memo(function MessageBubble({
  isUser,
  loading,
  userProfile,
  children,
}: Props) {
  const avatarSrc = isUser
    ? (userProfile ??
      "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp2/user-02_mlqqqt.png")
    : ((logo as unknown as string) ??
      "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp2/user-01_i5l7tp.png");

  const text =
    typeof children === "string"
      ? children
      : // render text from <p> children if needed in future; for now empty when non-string
        "";

  return (
    <article className={cn("flex items-start gap-4", isUser && "justify-end")}>
      <img
        className={cn(
          "rounded-full shadow-sm",
          isUser ? "order-1" : "border-border/40 border p-1",
        )}
        src={avatarSrc}
        alt={isUser ? "User profile" : "Assistant logo"}
        width={45}
        height={45}
      />
      <div
        className={cn(isUser ? "bg-muted rounded-xl px-4 py-3" : "space-y-1")}
      >
        <div className="flex flex-col gap-3">
          <p className="sr-only">{isUser ? "You" : "Assistant"} said:</p>
          {typeof children === "string" ? (
            <MarkdownMessage
              className="prose-p:p-0 prose-p:text-lg prose-li:text-lg prose-li:text-foreground prose-p:text-foreground"
              content={children}
            />
          ) : (
            children
          )}
        </div>
        {!isUser && !loading && <MessageActions content={text} />}
      </div>
    </article>
  );
});
