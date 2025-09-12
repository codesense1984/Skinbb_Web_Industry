# Discount Coupons Feature

This feature provides complete CRUD functionality for managing discount coupons in the master panel.

## Features

- **List View**: Display all coupons with pagination, sorting, and filtering
- **Create**: Add new discount coupons with validation
- **Edit**: Update existing coupon details
- **View**: Detailed view of coupon information
- **Delete**: Remove coupons (with confirmation)

## API Integration

The feature integrates with the following API endpoints:

- `GET /api/v1/coupons/admin/all` - List all coupons with pagination
- `GET /api/v1/coupons/admin/:id` - Get coupon by ID
- `POST /api/v1/coupons/admin` - Create new coupon
- `PUT /api/v1/coupons/admin/:id` - Update coupon
- `DELETE /api/v1/coupons/admin/:id` - Delete coupon

## Components

### Pages
- `DiscountCouponList` - Main list view with data table
- `CreateDiscountCoupon` - Create new coupon form
- `EditDiscountCoupon` - Edit existing coupon form
- `ViewDiscountCoupon` - Detailed coupon view

### Shared Components
- `CouponForm` - Reusable form component for create/edit
- `couponFormSchema` - Zod validation schema
- `columns` - Data table column definitions
- `fetcher` - API data fetcher for the data table

## Coupon Types

The system supports three types of coupons:

1. **Discount** - Percentage or fixed amount discount
2. **BOGO** - Buy One Get One offers
3. **Free Shipping** - Free shipping offers

## Discount Types

- **Percentage** - Discount as a percentage (0-100%)
- **Fixed** - Fixed amount discount in currency
- **Free Product** - Free product offer

## Form Validation

The form includes comprehensive validation:

- Coupon code: 3-50 characters, uppercase letters, numbers, hyphens, underscores only
- Title: 3-100 characters
- Description: 10-500 characters
- Discount value: Appropriate range based on discount type
- Usage limit: 1-1,000,000
- Date validation: Expiry date must be after valid from date

## Usage

```tsx
import { 
  DiscountCouponList, 
  CreateDiscountCoupon, 
  EditDiscountCoupon,
  ViewDiscountCoupon 
} from "@/modules/panel/features/master/discount-coupons";

// Use in your routes
<Route path="/master/discount-coupons" element={<DiscountCouponList />} />
<Route path="/master/discount-coupons/create" element={<CreateDiscountCoupon />} />
<Route path="/master/discount-coupons/:id/edit" element={<EditDiscountCoupon />} />
<Route path="/master/discount-coupons/:id/view" element={<ViewDiscountCoupon />} />
```

## Data Structure

```typescript
interface Coupon {
  _id: string;
  code: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed" | "free_product";
  discountValue: number;
  type: "bogo" | "discount" | "free_shipping";
  isActive: boolean;
  status: "active" | "expired" | "inactive";
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}
```

## Features Implemented

- ✅ List view with data table
- ✅ Create new coupon
- ✅ Edit existing coupon
- ✅ View coupon details
- ✅ Delete functionality (with confirmation)
- ✅ Form validation
- ✅ Status management
- ✅ Date range validation
- ✅ Usage tracking
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
