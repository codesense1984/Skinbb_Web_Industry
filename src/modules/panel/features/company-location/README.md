# Company Location Module

This module provides functionality to manage company locations.

## API Endpoint

The module uses the following API endpoint:

```
GET https://api.skintruth.in/api/v1/company/{companyId}/locations?page=1&limit=20
```

### Request Parameters

- `companyId` (path, required): Company ID
- `userId` (query, optional): User ID to get assigned location details
- `page` (query, optional): Page number for pagination (default: 1)
- `limit` (query, optional): Number of items per page (default: 20)

### Response Format

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "_id": "68be784c5628d13d29ce7cc9",
        "sellerId": "68be779f1a7070d93988009f",
        "addressType": "office",
        "gstNumber": "863",
        "panNumber": "861",
        "panDocument": "68be784b5628d13d29ce7cb7",
        "gstDocument": "68be784b5628d13d29ce7cb5",
        "coiCertificate": "68be784b5628d13d29ce7cbd",
        "msmeCertificate": "68be784b5628d13d29ce7cbb",
        "addressLine1": "752 First Extension",
        "landmark": "982 South New Street",
        "city": "Mumbai",
        "state": "MH",
        "postalCode": "348753",
        "country": "IN",
        "isPrimary": false,
        "status": "pending",
        "createdAt": "2025-09-08T06:31:40.202Z",
        "updatedAt": "2025-09-08T06:31:40.202Z",
        "__v": 0
      }
    ],
    "page": 1,
    "limit": 1,
    "total": 2
  },
  "message": "Locations retrieved successfully",
  "success": true
}
```

## Usage

### Route Configuration

Add the following route to your router configuration:

```tsx
import CompanyLocationList from "@/modules/panel/features/company-location/list";

// In your routes array
{
  path: "/company-location/:companyId",
  Component: CompanyLocationList,
}
```

### Component Usage

The component automatically extracts the `companyId` from the URL parameters and fetches the company locations.

```tsx
// URL: /company-location/68be779f1a7070d93988009f
// The component will automatically fetch locations for company ID: 68be779f1a7070d93988009f
```

## Features

- **Server-side pagination**: Efficiently handles large datasets
- **Status filtering**: Filter locations by status (pending, approved, rejected, etc.)
- **Responsive design**: Works on all screen sizes
- **Action buttons**: View and edit location details
- **Address display**: Shows formatted address information
- **Document tracking**: Displays GST and PAN numbers
- **Primary location indicator**: Highlights primary locations

## File Structure

```
src/modules/panel/features/company-location/
├── list/
│   ├── index.tsx          # Main list component
│   └── data.tsx           # Table columns configuration
├── types/
│   └── company-location.type.ts  # TypeScript types
└── services/
    └── http/
        └── company-location.service.ts  # API service functions
```

## Dependencies

- React Router (for URL parameters)
- TanStack Table (for data table functionality)
- Custom UI components (Badge, StatusBadge, etc.)
- Core utilities (date formatting, etc.)
