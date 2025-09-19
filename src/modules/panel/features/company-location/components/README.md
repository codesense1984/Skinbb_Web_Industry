# Company Location View Components

This directory contains reusable components for displaying company location details.

## Components

### CompanyLocationViewCore

The core reusable component that encapsulates both functionality and UI for displaying company location details.

**Props:**
- `companyId: string` - The company ID
- `locationId: string` - The location ID  
- `showApprovalActions?: boolean` - Whether to show approval actions (default: true)
- `customHeader?: object` - Custom header configuration with title, description, and actions

**Usage:**
```tsx
import { CompanyLocationViewCore } from "@/modules/panel/features/company-location/components/CompanyLocationViewCore";

<CompanyLocationViewCore
  companyId="company123"
  locationId="location456"
  showApprovalActions={true}
  customHeader={{
    title: "Custom Title",
    description: "Custom description"
  }}
/>
```

## Usage Examples

### 1. Panel Module (using useParams)

```tsx
import { useParams } from "react-router";
import { CompanyLocationViewCore } from "../components/CompanyLocationViewCore";

const PanelCompanyLocationView = () => {
  const { companyId, locationId } = useParams();

  if (!companyId || !locationId) {
    return <div>Missing parameters</div>;
  }

  return (
    <CompanyLocationViewCore
      companyId={companyId}
      locationId={locationId}
      showApprovalActions={true}
    />
  );
};
```

### 2. Seller Module (using useSellerAuth)

```tsx
import { SellerCompanyLocationView } from "@/modules/seller";

const SellerLocationPage = () => {
  return (
    <SellerCompanyLocationView
      showApprovalActions={false}
      customHeader={{
        title: "My Location Details",
        description: "View your company location information"
      }}
    />
  );
};
```

### 3. Seller Module with Specific Location

```tsx
import { SellerCompanyLocationView } from "@/modules/seller";

const SpecificLocationPage = () => {
  return (
    <SellerCompanyLocationView
      locationId="specific-location-id"
      showApprovalActions={false}
    />
  );
};
```

## Features

- **Reusable**: Can be used in both panel and seller modules
- **Flexible**: Supports custom headers and approval actions
- **Type-safe**: Full TypeScript support
- **Error handling**: Comprehensive error states and loading states
- **Responsive**: Mobile-friendly design
- **Accessible**: Proper ARIA labels and semantic HTML

## Dependencies

- React Query for data fetching
- React Router for navigation
- Heroicons for icons
- Tailwind CSS for styling
- Sonner for toast notifications
