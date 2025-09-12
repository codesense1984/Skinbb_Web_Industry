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
  - Applied card-based styling similar to product forms
  - Added `PageContent` wrapper with proper headers
  - Organized form sections into logical cards
  - **Added Authorization Letter field** for document upload in create/edit modes

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
    authorizationLetter: brandData?.authorizationLetter || "",
    isActive: brandData?.isActive ? "true" : "false",
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

### 4. Card-Based Styling

#### Beautiful Card Layout
The form now uses a card-based layout similar to product forms:

```tsx
<div className="w-full">
  <div className="bg-background rounded-xl border shadow-sm p-8">
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Information */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <FormFieldsRenderer<BrandFormData>
                control={control}
                fieldConfigs={brandSchema.basic_information({ mode })}
                className="space-y-6"
              />
            </CardContent>
          </Card>

          {/* Right Column - Business Metrics */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Business Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <FormFieldsRenderer<BrandFormData>
                control={control}
                fieldConfigs={brandSchema.business_metrics({ mode })}
                className="space-y-6"
              />
            </CardContent>
          </Card>
        </div>
        {/* More cards... */}
      </form>
    </div>
  </div>
```

#### Card Layout Features
- **Responsive Grid**: 2-column layout on large screens, single column on mobile
- **Consistent Styling**: Matches product form styling patterns
- **Clear Sections**: Each form section is organized in its own card
- **Professional Look**: Clean borders, shadows, and spacing
- **Page Headers**: Dynamic titles and descriptions based on mode

### 5. Form Pattern Benefits

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
    {
      name: "authorizationLetter",
      label: "Authorization Letter",
      type: INPUT_TYPES.FILE,
      placeholder: "Upload authorization letter",
      disabled: mode === MODE.VIEW,
      required: mode === MODE.ADD || mode === MODE.EDIT,
      inputProps: {
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
      },
    },
    {
      name: "isActive",
      label: "Status",
      type: INPUT_TYPES.SELECT,
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
      placeholder: "Select status",
      disabled: mode === MODE.VIEW,
    },
    // ... more fields
  ],
  // ... more sections
};
```

### 6. Authorization Letter Field

The form now includes an **Authorization Letter** field for document upload:

- **File Type**: Uses `INPUT_TYPES.FILE` for file upload
- **Required**: Required in CREATE and EDIT modes, optional in VIEW mode
- **File Types**: Accepts PDF, DOC, DOCX, JPG, JPEG, PNG files
- **Styling**: Uses existing form-input component styling for consistency
- **Validation**: Built-in file validation through the form-input component

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
