import { cn } from "@/core/utils";
import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";

type TitledSectionProps<T extends ElementType = "section"> = {
  as?: T;
  title: string;
  showDivider?: boolean;
  titleProps?: ComponentPropsWithRef<"h2">;
  headerProps?: ComponentPropsWithRef<"div">;
  children?: ReactNode;
  actions?: ReactNode;
} & ComponentPropsWithRef<T>;

export function TitledSection<T extends ElementType = "section">({
  as,
  title,
  showDivider = true,
  titleProps = {},
  headerProps = {},
  actions,
  children,
  ...rest
}: TitledSectionProps<T>) {
  const Tag = as || "section";
  const { className: headerClassName, ...restHeaderProps } = headerProps;

  return (
    <Tag {...rest}>
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-4",
          showDivider && "mb-6 border-b pb-2",
          actions && "pb-3",
          headerClassName,
        )}
        {...restHeaderProps}
      >
        <h2 className="mt-auto text-lg font-medium" {...titleProps}>
          {title}
        </h2>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
      {/* {showDivider && <hr className="mt-2 mb-5" />} */}
      {children}
    </Tag>
  );
}
