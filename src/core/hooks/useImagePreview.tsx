import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { Button } from "@/core/components/ui/button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type JSX,
} from "react";

type UseImagePreviewOptions = {
  alt?: string;
  placeholder?: string; // URL for default image if file not present
  fallback?: JSX.Element;
  showRemoveButton?: boolean;
  clear?: () => void;
  imageProps?: ComponentProps<typeof AvatarImage>;
  fallbackProps?: ComponentProps<typeof AvatarFallback>;
  avatarProps?: ComponentProps<typeof Avatar>;
};

type UseImagePreviewResult = {
  url: string | null;
  element: JSX.Element | null;
  clear: () => void;
};

export function useImagePreview(
  file?: File | null,
  options: UseImagePreviewOptions = {},
): UseImagePreviewResult {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(options?.placeholder ?? null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, options.placeholder]);

  const clear = useCallback(() => {
    setPreviewUrl(options.placeholder ?? null);
    options.clear?.();
  }, [options]);

  const element = useMemo<JSX.Element | null>(() => {
    return (
      <Avatar className="size-28 rounded-md border" {...options.avatarProps}>
        {previewUrl && options.showRemoveButton !== false && (
          <Button
            variant="contained"
            type="button"
            className="border-border absolute top-2 right-2 size-5 border p-0 [&_svg]:size-3"
            onClick={clear}
          >
            <XMarkIcon />
          </Button>
        )}
        <AvatarImage
          src={previewUrl ?? undefined}
          alt={options.alt ?? "Preview"}
          {...options.imageProps}
        />
        <AvatarFallback className="rounded-md" {...options.fallbackProps}>
          {options.fallback}
        </AvatarFallback>
      </Avatar>
    );
  }, [previewUrl, clear, options]);

  return {
    url: previewUrl,
    element,
    clear,
  };
}
