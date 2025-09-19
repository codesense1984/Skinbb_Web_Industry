# Company View Components

This directory contains reusable components for displaying company details.

## Components

### CompanyViewCore

The core reusable component that encapsulates both functionality and UI for displaying company information and locations.

**Props:**
- `companyId: string` - The company ID
- `showViewUsersAction?: boolean` - Whether to show the "View Users" action button (default: true)
- `customHeader?: object` - Custom header configuration with title, description, and actions
- `onViewBrands?: (companyId: string, locationId: string) => void` - Custom handler for viewing brands
- `onViewUsers?: (companyId: string) => void` - Custom handler for viewing users

**Usage:**
```tsx
import { CompanyViewCore } from "@/modules/panel/features/company/components/CompanyViewCore";

<CompanyViewCore
  companyId="company123"
  showViewUsersAction={true}
  customHeader={{
    title: "Custom Title",
    description: "Custom description"
  }}
  onViewBrands={(companyId, locationId) => {
    // Custom navigation logic
  }}
  onViewUsers={(companyId) => {
    // Custom navigation logic
  }}
/>
```

## Usage Examples

### 1. Panel Module (using useParams)

```tsx
import { useParams } from "react-router";
import { CompanyViewCore } from "../components/CompanyViewCore";

const PanelCompanyView = () => {
  const { id } = useParams();

  if (!id) {
    return <div>Company ID not found</div>;
  }

  return (
    <CompanyViewCore
      companyId={id}
      showViewUsersAction={true}
    />
  );
};
```

### 2. Seller Module (using useSellerAuth)

```tsx
import { SellerCompanyView } from "@/modules/seller";

const SellerCompanyPage = () => {
  return (
    <SellerCompanyView
      showViewUsersAction={false}
      customHeader={{
        title: "My Company Details",
        description: "View your company information and locations"
      }}
    />
  );
};
```

### 3. Seller Module with Custom Actions

```tsx
import { SellerCompanyView } from "@/modules/seller";

const CustomSellerPage = () => {
  const handleViewBrands = (companyId: string, locationId: string) => {
    // Custom navigation logic
    navigate(`/seller/brands/${companyId}/${locationId}`);
  };

  const handleViewUsers = (companyId: string) => {
    // Custom navigation logic
    navigate(`/seller/team/${companyId}`);
  };

  return (
    <SellerCompanyView
      showViewUsersAction={true}
      onViewBrands={handleViewBrands}
      onViewUsers={handleViewUsers}
      customHeader={{
        title: "Company Overview",
        description: "Manage your company details and team"
      }}
    />
  );
};
```

## Features

- **Reusable**: Can be used in both panel and seller modules
- **Flexible**: Supports custom headers, actions, and navigation handlers
- **Type-safe**: Full TypeScript support
- **Error handling**: Comprehensive error states and loading states
- **Responsive**: Mobile-friendly design with accordion layout for locations
- **Accessible**: Proper ARIA labels and semantic HTML
- **Interactive**: Expandable location details with brand viewing capabilities

## Key Components

### LocationAccordionItem
- Displays individual company locations in an accordion format
- Shows location details when expanded
- Includes "View Brands" action button
- Handles loading and error states for location data

### InfoItem
- Reusable component for displaying information with icons
- Consistent styling across all information displays
- Supports custom styling and children elements

## Dependencies

- React Query for data fetching
- React Router for navigation
- Heroicons for icons
- Tailwind CSS for styling
- Accordion UI components for collapsible content
