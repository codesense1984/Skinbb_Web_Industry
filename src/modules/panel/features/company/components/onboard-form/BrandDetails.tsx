import { Alert } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Checkbox } from "@/core/components/ui/checkbox";
import { CheckboxTree } from "@/core/components/ui/checkbox-tree";
import {
  FormFieldsRenderer,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { Label } from "@/core/components/ui/label";
import { useImagePreview } from "@/core/hooks/useImagePreview";
import { MODE } from "@/core/types";
import {
  apiGetAllProductCategories,
  type ApiGetAllProductCategoriesResponse,
} from "@/modules/panel/services/http/master.service";
import { useQuery } from "@tanstack/react-query";
import { useId } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Fragment } from "react/jsx-runtime";
import {
  fullCompanyDetailsSchema,
  type FullCompanyFormType,
} from "../../schema/fullCompany.schema";
import { ComboBox, type Option } from "@/core/components/ui/combo-box";
import MultipleSelector from "@/core/components/ui/multiple-selector";

interface BrandDetailsProps {
  mode: MODE;
}

interface TreeNode {
  id: string;
  label: string;
  defaultChecked?: boolean;
  children?: TreeNode[];
}

type Category = ApiGetAllProductCategoriesResponse["data"];

function convertCategories(apiResponse: Category): Option[] {
  if (!apiResponse || !apiResponse) return [];

  const categories = apiResponse;

  // Group by parentId
  const map: Record<string, Category[]> = {};
  categories.forEach((cat) => {
    const parentKey = cat.parentId ?? "root";
    if (!map[parentKey]) {
      map[parentKey] = [];
    }
    map[parentKey].push(cat);
  });

  // Recursive builder
  function buildTree(parentId: string | null = null, level = 0): Option[] {
    const key = parentId ?? "root";
    if (!map[key]) return [];

    return map[key].flatMap((cat) => {
      const prefix = "--".repeat(level);
      const current: Option = {
        label: `${prefix}${cat.name}`,
        value: cat._id,
      };
      const children = buildTree(cat._id, level + 1);
      return [current, ...children];
    });
  }

  return buildTree(null, 0);
}

const OPTIONS: Option[] = [
  { label: "nextjs", value: "nextjs" },
  { label: "React", value: "react" },
  { label: "Remix", value: "remix" },
  { label: "Vite", value: "vite" },
  { label: "Nuxt", value: "nuxt" },
  { label: "Vue", value: "vue" },
  { label: "Svelte", value: "svelte" },
  { label: "Angular", value: "angular" },
  { label: "Ember", value: "ember", disable: true },
  { label: "Gatsby", value: "gatsby", disable: true },
  { label: "Astro", value: "astro" },
];

const initialTree: TreeNode = {
  id: "1",
  label: "Natural Wonders",
  children: [
    { id: "2", label: "Mountains", defaultChecked: true },
    {
      id: "3",
      label: "Waterfalls",
      children: [
        { id: "4", label: "Niagara Falls" },
        { id: "5", label: "Angel Falls", defaultChecked: true },
      ],
    },
    { id: "6", label: "Grand Canyon" },
  ],
};

const BrandDetails = ({ mode }: BrandDetailsProps) => {
  const { control, setValue } = useFormContext<FullCompanyFormType>();

  const profileData = useWatch({
    control,
    name: "brand_logo_files",
  })?.[0];

  const sellingOn =
    useWatch({
      control,
      name: "sellingOn",
    }) || [];

  // Fetch company details for dropdown
  const { data: categoriesResponse, isLoading: isLoadingProductCategories } =
    useQuery({
      queryKey: ["productCategories"],
      queryFn: () => apiGetAllProductCategories(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

  const formatted =
    categoriesResponse?.data.map((item) => ({
      value: item._id,
      label: item.name,
    })) ?? [];

  const { element } = useImagePreview(profileData, {
    clear: () => {
      setValue("brand_logo_files", undefined);
      setValue("brand_logo", "");
    },
  });

  const { fields, remove, append } = useFieldArray({
    control,
    name: "sellingOn",
  });

  const hasEmptyPlatforms = sellingOn.some(
    (field) => !field?.platform || !field?.url,
  );

  const addPlatform = () => {
    // Check if there are any empty platforms first
    const hasEmptyPlatforms = sellingOn.some(
      (platform) => !platform?.platform || !platform?.url,
    );
    if (hasEmptyPlatforms) {
      // Don't add new platform if there are empty ones
      return;
    }

    // Check if there are duplicate platforms
    if (hasDuplicatePlatforms()) {
      // Don't add new platform if there are duplicates
      return;
    }

    append({ platform: "", url: "" });
  };

  // Get available platform options (exclude already selected ones, except "Other")
  const getAvailablePlatformOptions = (currentIndex: number) => {
    const selectedPlatforms = sellingOn
      .map((platform, index) =>
        index !== currentIndex ? platform?.platform : null,
      )
      .filter(Boolean);

    const allOptions = [
      { label: "Amazon", value: "amazon" },
      { label: "Flipkart", value: "flipkart" },
      { label: "Myntra", value: "myntra" },
      { label: "Nykaa", value: "nykaa" },
      { label: "Purplle", value: "purplle" },
      { label: "Other", value: "other" },
    ];

    return allOptions.filter((option) => {
      // "Other" can be selected multiple times
      if (option.value === "other") {
        return true;
      }
      // All other platforms can only be selected once
      return !selectedPlatforms.includes(option.value);
    });
  };

  // Check if there are duplicate platforms (excluding "Other")
  const hasDuplicatePlatforms = () => {
    const platforms = sellingOn
      .map((platform) => platform?.platform)
      .filter(Boolean)
      .filter((platform) => platform !== "other"); // Exclude "Other" from duplicate check

    return new Set(platforms).size !== platforms.length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {element}
        <FormFieldsRenderer<FullCompanyFormType>
          className="w-full grid-cols-1 sm:grid-cols-1 lg:grid-cols-1"
          control={control}
          fieldConfigs={
            fullCompanyDetailsSchema.uploadbrandImage({
              mode,
            }) as FormFieldConfig<FullCompanyFormType>[]
          }
        />
      </div>

      {/* <MultipleSelector
        defaultOptions={OPTIONS}
        placeholder="Select frameworks you like..."
        emptyIndicator={
          <p className="text-center text-lg">no results found.</p>
        }
      /> */}
      <ComboBox
        multi
        options={formatted}
        placeholder="Select frameworks you like..."
        onChange={(value) => {
          console.log(value);
        }}
        maxVisibleItems={5}
      />

      {/* <CheckboxTree
        tree={initialTree}
        onChange={(checkedIds) => {
          console.log(checkedIds);
        }}
        renderNode={({ node, isChecked, onCheckedChange, children }) => (
          <Fragment key={`${id}-${node.id}`}>
            <div className="flex items-center gap-2">
              <Checkbox
                id={`${id}-${node.id}`}
                checked={isChecked}
                onCheckedChange={onCheckedChange}
              />
              <Label htmlFor={`${id}-${node.id}`}>{node.label}</Label>
            </div>
            {children && <div className="ms-6 space-y-3">{children}</div>}
          </Fragment>
        )}
      /> */}

      <FormFieldsRenderer<FullCompanyFormType>
        control={control}
        fieldConfigs={
          fullCompanyDetailsSchema.brand_information({
            mode,
            productCategoryOptions: formatted,
          }) as FormFieldConfig<FullCompanyFormType>[]
        }
        className="gap-6 lg:grid-cols-6"
      />

      {/* Selling Platforms Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h6 className="font-medium">Selling Platforms</h6>
            <p className="text-muted-foreground text-sm">
              Add the platforms where you sell your products
            </p>
          </div>
          <Button
            type="button"
            variant="outlined"
            color={"primary"}
            onClick={addPlatform}
            disabled={mode === MODE.VIEW || hasEmptyPlatforms}
            className="text-sm"
          >
            + Add Platform
          </Button>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-center gap-4 rounded-lg border p-4"
          >
            <div className="flex-1">
              <FormFieldsRenderer<FullCompanyFormType>
                control={control}
                fieldConfigs={
                  fullCompanyDetailsSchema.selling_platforms({
                    mode,
                    index,
                    availableOptions: getAvailablePlatformOptions(index),
                  }) as FormFieldConfig<FullCompanyFormType>[]
                }
                className="gap-4 lg:grid-cols-6"
              />
            </div>
            {
              <Button
                type="button"
                variant="outlined"
                onClick={() => remove(index)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Remove
              </Button>
            }
          </div>
        ))}

        <Alert
          variant="info"
          title="URL Tips:"
          description={
            <ul className="mt-2 space-y-1">
              <li>
                • Platform URLs: Enter full URLs (e.g., "https://amazon.in",
                "https://flipkart.com")
              </li>
              <li>
                • Social Media URLs: Enter full URLs (e.g.,
                "https://instagram.com/yourbrand")
              </li>
            </ul>
          }
        />
      </div>
    </div>
  );
};

export default BrandDetails;
