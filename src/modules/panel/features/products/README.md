# Product Management Feature

This feature provides product creation and editing functionality for the Skinbb_Web_Industry panel, implemented using React Hook Form and Zod validation.

## Structure

```
products/
├── components/
│   └── product-form/
│       └── ProductForm.tsx          # Shared form component
├── create/
│   └── index.tsx                    # Product creation page
├── edit/
│   └── index.tsx                    # Product editing page
├── schema/
│   └── product.schema.ts            # Zod validation schemas
├── services/
│   └── product.service.ts           # API service functions
├── types/
│   └── product.types.ts             # TypeScript type definitions
├── utils/
│   └── product.utils.ts             # Utility functions
└── index.ts                         # Feature exports
```

## Features

### ProductCreate Component
- Form for creating new products
- Uses react-hook-form for form state management
- Zod validation for form validation
- Handles form submission and API calls
- Error handling with toast notifications

### ProductEdit Component
- Form for editing existing products
- Fetches product data using React Query
- Pre-populates form with existing data
- Handles form submission and API updates
- Loading and error states

### ProductForm Component
- Shared form component used by both create and edit
- Comprehensive form sections:
  - General Information (name, slug, description)
  - Pricing & Inventory (price, sale price, quantity)
  - Status management
  - Image uploads (thumbnail, product images)
  - Dynamic meta fields based on API configuration
- Form validation using Zod
- Responsive design with proper layout

## Usage

### Import Components
```typescript
import { ProductCreate, ProductEdit, ProductForm } from '@/modules/panel/features/products';
```

### Use in Routes
```typescript
// Create route
<Route path="/panel/products/create" element={<ProductCreate />} />

// Edit route
<Route path="/panel/products/:id/edit" element={<ProductEdit />} />
```

## API Integration

The feature includes mock API services that can be easily replaced with actual API calls:

- `apiCreateProduct(data)` - Create new product
- `apiUpdateProduct(id, data)` - Update existing product
- `apiGetProductById(id)` - Fetch product by ID
- `apiGetProductAttributes(params)` - Fetch product attributes
- `apiGetProductAttributeValues(params)` - Fetch attribute values
- `apiGetProductMetaFieldAttributes(params)` - Fetch meta fields

## Form Validation

Uses Zod schema validation with the following key validations:

- **Product Name**: Required field
- **Slug**: Required, must contain only lowercase letters, numbers, and hyphens
- **Description**: Optional
- **Pricing**: Optional numeric fields for price, sale price, quantity
- **Images**: File upload validation
- **Meta Fields**: Dynamic validation based on field configuration

## Type Safety

Comprehensive TypeScript types are provided:

- `ProductFormSchema` - Form data structure
- `ProductReqData` - API request data structure
- `SelectOption` - Dropdown option structure
- `MetaFieldValue` - Meta field value structure
- `FormSectionBaseProps` - Form section component props

## Dependencies

- `react-hook-form` - Form state management
- `@hookform/resolvers/zod` - Zod integration
- `zod` - Schema validation
- `@tanstack/react-query` - Data fetching
- `sonner` - Toast notifications

## Notes

- The implementation follows the same patterns as the company onboarding feature
- Form sections are organized for better UX and maintainability
- Error handling includes both field-level and general error messages
- The form supports both simple and variant products
- Meta fields are dynamically loaded and rendered based on API configuration

