import logo from "@/assets/images/logo-icon.png";
import { cn } from "@/utils";
import { CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { MarkdownMessage } from "../ui/markdown";
import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "../ui/tooltip";

type ChatMessageProps = {
  isUser?: boolean;
  loading?: boolean;
  userProfile?: string;
  children: React.ReactNode;
};

export function ChatMessage({
  isUser,
  loading,
  userProfile,
  children,
}: ChatMessageProps) {
  return (
    <article className={cn("flex items-start gap-4", isUser && "justify-end")}>
      <img
        className={cn(
          "rounded-full shadow-sm",
          isUser ? "order-1" : "border-border/40 border p-1",
        )}
        src={
          isUser
            ? (userProfile ??
              "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp2/user-02_mlqqqt.png")
            : (logo ??
              "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp2/user-01_i5l7tp.png")
        }
        alt={isUser ? "User profile" : "Bart logo"}
        width={45}
        height={45}
      />
      <div
        className={cn(isUser ? "bg-muted rounded-xl px-4 py-3" : "space-y-4")}
      >
        <div className="flex flex-col gap-3">
          <p className="sr-only">{isUser ? "You" : "ChatGPT"} said:</p>
          {typeof children === "string" ? (
            <MarkdownMessage
              className="prose-p:p-0 prose-p:text-lg"
              content={children}
            />
          ) : (
            children
          )}
        </div>
        {!isUser && !loading && <MessageActions>{children}</MessageActions>}
      </div>
    </article>
  );
}

type ActionButtonProps = {
  icon: React.ReactNode;
  label: string;
} & React.ComponentProps<typeof Button>;

function ActionButton({ icon, label, ...rest }: ActionButtonProps) {
  return (
    <TooltipRoot>
      <TooltipTrigger asChild>
        <Button
          variant={"link"}
          className="text-muted-foreground hover:text-foreground size-8 [&_svg]:size-4"
          {...rest}
        >
          {icon}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{label}</p>
      </TooltipContent>
    </TooltipRoot>
  );
}

function MessageActions({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const content = typeof children === "string" ? children : "";

    try {
      const permission = await navigator.permissions.query({
        name: "clipboard-write" as PermissionName,
      });

      if (permission.state === "granted" || permission.state === "prompt") {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } else {
        toast.error(
          "Clipboard permission denied. Please enable it in your browser settings.",
        );
      }
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      toast.error("Copy failed. Please try again or use Ctrl+C manually.");
    }
  };

  return (
    <div className="relative inline-flex rounded-md border p-0.5 shadow-sm">
      <TooltipProvider delayDuration={0}>
        <ActionButton
          onClick={handleCopy}
          icon={copied ? <CheckIcon /> : <DocumentDuplicateIcon />}
          label="Copy"
        />
        {/* <div className="bg-border my-auto h-[15px] w-[1px] rounded-md"></div>
        <ActionButton
          onClick={handleCopy}
          icon={copied ? <CheckIcon /> : <DocumentDuplicateIcon />}
          label="Copy"
        />
        <ActionButton
          onClick={handleCopy}
          icon={copied ? <CheckIcon /> : <DocumentDuplicateIcon />}
          label="Copy"
        /> */}
        {/* {/* <ActionButton icon={<RiCodeSSlashLine size={16} />} label="Show code" /> */}
        {/* <ActionButton icon={<RiBookLine size={16} />} label="Bookmark" />
        <ActionButton icon={<RiLoopRightFill size={16} />} label="Refresh" />
        <ActionButton icon={<RiCheckLine size={16} />} label="Approve" /> */}
      </TooltipProvider>
    </div>
  );
}
