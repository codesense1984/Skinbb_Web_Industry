import { useCallback, useMemo } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";
import type { BrandFormData } from "../brand.schema";

const PLATFORM_OPTIONS = [
  { label: "Amazon", value: "amazon" },
  { label: "Flipkart", value: "flipkart" },
  { label: "Myntra", value: "myntra" },
  { label: "Nykaa", value: "nykaa" },
  { label: "Purplle", value: "purplle" },
  { label: "Other", value: "other" },
] as const;

interface UseSellingPlatformsProps {
  control: Control<BrandFormData>;
}

export const useSellingPlatforms = ({ control }: UseSellingPlatformsProps) => {
  const sellingOn = useWatch({ control, name: "sellingOn" }) || [];
  const { remove, fields, append } = useFieldArray({
    control,
    name: "sellingOn",
  });

  const hasDuplicatePlatforms = useMemo(() => {
    const platforms = sellingOn
      .map((platform) => platform?.platform)
      .filter(Boolean)
      .filter((platform) => platform !== "other");
    return new Set(platforms).size !== platforms.length;
  }, [sellingOn]);

  const getAvailablePlatformOptions = useCallback(
    (currentIndex: number) => {
      const selectedPlatforms = sellingOn
        .map((platform, index) =>
          index !== currentIndex ? platform?.platform : null,
        )
        .filter(Boolean);

      return PLATFORM_OPTIONS.filter((option) => {
        if (option.value === "other") {
          return true;
        }
        return !selectedPlatforms.includes(option.value);
      });
    },
    [sellingOn],
  );

  const addPlatform = useCallback(() => {
    if (hasDuplicatePlatforms) {
      return;
    }
    append({ platform: "", url: "" });
  }, [hasDuplicatePlatforms, append]);

  return {
    sellingOn: fields,
    hasDuplicatePlatforms,
    getAvailablePlatformOptions,
    addPlatform,
    removePlatform: remove,
    platformOptions: PLATFORM_OPTIONS,
  };
};
