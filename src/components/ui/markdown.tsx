import { cn } from "@/utils";
import ReactMarkdown from "react-markdown";

type Props = {
  content: string;
  className?: string;
};

export const MarkdownMessage = ({ content, className }: Props) => {
  return (
    <div
      className={cn(
        "prose max-w-none leading-relaxed",
        className,
      )}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};
