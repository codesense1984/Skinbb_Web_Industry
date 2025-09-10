# Company Location Brands - Form Refactoring

This directory contains the refactored company location brands components that now use the `form-input` component pattern, following the same approach as the company onboarding forms.

## Key Changes

### 1. Schema-Based Configuration
- **File**: `schema/brand.schema.tsx`
- **Purpose**: Centralized field configuration using the same pattern as company onboarding
- **Benefits**: 
  - Consistent field definitions
  - Easy to maintain and modify
  - Type-safe field configurations
  - Reusable across different modes (ADD, EDIT, VIEW)

### 2. Form Component Refactoring
- **File**: `shared/brand-form.tsx`
- **Changes**:
  - Replaced manual form field rendering with `FormFieldsRenderer`
  - Used `FormProvider` for form context
  - Implemented `useFieldArray` for dynamic fields (selling platforms)
  - Removed manual error handling in favor of built-in form validation
  - Used schema-based field configurations

### 3. Default Values Function Pattern

#### Centralized Default Values
```tsx
// Default values function with parameters
const getDefaultValues = (brandData?: CompanyLocationBrand | null): BrandFormData => {
  return {
    name: brandData?.name || "",
    aboutTheBrand: brandData?.aboutTheBrand || "",
    websiteUrl: brandData?.websiteUrl || "",
    totalSKU: brandData?.totalSKU ? String(brandData.totalSKU) : "0",
    averageSellingPrice: brandData?.averageSellingPrice ? String(brandData.averageSellingPrice) : "0",
    marketingBudget: brandData?.marketingBudget ? String(brandData.marketingBudget) : "0",
    instagramUrl: brandData?.instagramUrl || "",
    facebookUrl: brandData?.facebookUrl || "",
    youtubeUrl: brandData?.youtubeUrl || "",
    productCategory: brandData?.productCategory || [],
    sellingOn: brandData?.sellingOn || [],
    isActive: brandData?.isActive ?? true,
  };
};

// Usage in form initialization
const form = useForm<BrandFormData>({
  resolver: zodResolver(brandFormSchema),
  defaultValues: getDefaultValues(), // Empty form
});

// Usage for resetting with API data
useEffect(() => {
  if (brand && (mode === MODE.EDIT || mode === MODE.VIEW)) {
    form.reset(getDefaultValues(brand)); // Reset with API data
  }
}, [brand, mode, form]);
```

### 4. Form Pattern Benefits

#### Before (Manual Approach)
```tsx
<div className="space-y-2">
  <Label htmlFor="name">Brand Name *</Label>
  <Input
    id="name"
    {...form.register("name")}
    placeholder="Enter brand name"
    disabled={mode === "view"}
  />
  {errors.name && (
    <p className="text-sm text-red-600">{errors.name.message}</p>
  )}
</div>
```

#### After (Form-Input Pattern)
```tsx
<FormFieldsRenderer<BrandFormData>
  control={control}
  fieldConfigs={brandSchema.basic_information({ mode })}
  className="grid grid-cols-1 gap-6 md:grid-cols-2"
/>
```

### 5. Schema Configuration Example

```tsx
export const brandSchema: BrandSchemaProps = {
  basic_information: ({ mode }) => [
    {
      name: "name",
      label: "Brand Name",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter brand name",
      required: true,
      disabled: mode === MODE.VIEW,
    },
    {
      name: "websiteUrl",
      label: "Website URL",
      type: INPUT_TYPES.TEXT,
      placeholder: "https://example.com",
      disabled: mode === MODE.VIEW,
    },
    // ... more fields
  ],
  // ... more sections
};
```

## Usage

### Basic Form Usage
```tsx
import { FormFieldsRenderer } from "@/core/components/ui/form-input";
import { brandSchema } from "../schema/brand.schema";

// In your component
<FormFieldsRenderer<BrandFormData>
  control={control}
  fieldConfigs={brandSchema.basic_information({ mode })}
  className="grid grid-cols-1 gap-6 md:grid-cols-2"
/>
```

### Dynamic Fields (Field Arrays)
```tsx
import { useFieldArray } from "react-hook-form";

const { fields, append, remove } = useFieldArray({
  control,
  name: "sellingOn",
});

// Render dynamic fields
{fields.map((field, index) => (
  <FormFieldsRenderer<BrandFormData>
    key={field.id}
    control={control}
    fieldConfigs={brandSchema.selling_platforms({
      mode,
      index,
      availableOptions: getAvailableOptions(index),
    })}
  />
))}
```

## File Structure

```
company-location-brands/
├── schema/
│   └── brand.schema.tsx          # Field configuration schema
├── shared/
│   └── brand-form.tsx            # Refactored form component
├── examples/
│   └── form-usage-example.tsx    # Usage example
└── README.md                     # This documentation
```

## Key Features

1. **Consistent with Onboarding**: Uses the same pattern as company onboarding forms
2. **Type Safety**: Full TypeScript support with proper typing
3. **Mode Support**: Handles ADD, EDIT, and VIEW modes consistently
4. **Validation**: Built-in form validation using Zod schema
5. **Dynamic Fields**: Support for field arrays (selling platforms)
6. **Reusable**: Schema can be reused across different components
7. **Maintainable**: Centralized field configuration makes updates easier
8. **Default Values Function**: Centralized function for form initialization and reset
9. **Data Transformation**: Automatic conversion between API data and form data
10. **Reset Functionality**: Easy form reset with default or API data

## Migration Guide

If you have other forms that need to be refactored to use this pattern:

1. **Create a schema file** with field configurations
2. **Replace manual form fields** with `FormFieldsRenderer`
3. **Use `FormProvider`** to wrap your form
4. **Implement `useFieldArray`** for dynamic fields
5. **Remove manual error handling** (handled by form-input component)
6. **Use schema-based configurations** for consistency

## Benefits

- **Reduced Code Duplication**: Common form patterns are abstracted
- **Consistent UI**: All forms follow the same design patterns
- **Better Maintainability**: Changes to form behavior are centralized
- **Type Safety**: Compile-time checking for form fields
- **Easier Testing**: Form logic is separated from UI logic
- **Better UX**: Consistent validation and error handling
