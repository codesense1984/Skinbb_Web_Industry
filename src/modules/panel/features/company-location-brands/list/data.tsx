import {
  TableAction,
} from "@/core/components/data-table/components/table-action";
import { Avatar } from "@/core/components/ui/avatar";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { formatDate, formatCurrency } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { CompanyLocationBrand } from "@/modules/panel/types/brand.type";
import type { ColumnDef } from "@tanstack/react-table";

// Extended brand type that includes location information
export interface CompanyLocationBrandWithLocation extends CompanyLocationBrand {
  locationId: string;
  locationType: string;
  locationCity: string;
  locationState: string;
}

export const columns = (companyId: string, locationId: string): ColumnDef<CompanyLocationBrandWithLocation>[] => [
  {
    header: "Brand Name",
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="flex w-max items-center gap-3 font-medium">
        {row.original.logoImage && (
          <Avatar
            src={row.original.logoImage}
            feedback={row.original.name.charAt(0)}
          />
        )}
        <span>{row.original.name}</span>
      </div>
    ),
  },
  {
    header: "Website",
    accessorKey: "websiteUrl",
    cell: ({ row }) => (
      <a
        href={row.original.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800"
      >
        {row.original.websiteUrl}
      </a>
    ),
  },
  {
    header: "Total SKU",
    accessorKey: "totalSKU",
    cell: ({ row }) => (
      <div className="w-max">{row.original.totalSKU}</div>
    ),
  },
  {
    header: "Avg. Selling Price",
    accessorKey: "averageSellingPrice",
    cell: ({ row }) => (
      <div className="w-max">{formatCurrency(row.original.averageSellingPrice)}</div>
    ),
  },
  {
    header: "Marketing Budget",
    accessorKey: "marketingBudget",
    cell: ({ row }) => (
      <div className="w-max">{formatCurrency(row.original.marketingBudget)}</div>
    ),
  },
  {
    header: "Product Categories",
    accessorKey: "productCategory",
    cell: ({ row }) => {
      const categories = row.original.productCategory || [];
      
      // Handle both string array and object array formats
      const categoryNames = categories.map((category: any) => {
        if (typeof category === 'string') {
          return category;
        } else if (category && typeof category === 'object' && category.name) {
          return category.name;
        }
        return String(category);
      });

      return (
        <div className="flex flex-wrap gap-1">
          {categoryNames.slice(0, 2).map((category, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {category}
            </Badge>
          ))}
          {categoryNames.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{categoryNames.length - 2} more
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    header: "Status",
    accessorKey: "isActive",
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.isActive ? "active" : "inactive"}
        module="brand"
        variant="badge"
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </StatusBadge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id) ? "active" : "inactive");
    },
  },
  {
    header: "Created Date",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return <div className="w-max">{formatDate(createdAt)}</div>;
    },
  },
  {
    header: "Action",
    accessorKey: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <TableAction
          view={{
            onClick: () => console.log("View brand:", row.original._id),
            to: PANEL_ROUTES.COMPANY_LOCATION.BRAND_VIEW(companyId, locationId, row.original._id),
            title: "View brand details",
          }}
          edit={{
            loading: false,
            onClick: () => console.log("Edit brand:", row.original._id),
            to: PANEL_ROUTES.COMPANY_LOCATION.BRAND_EDIT(companyId, locationId, row.original._id),
            title: "Edit brand",
          }}
          delete={{
            onClick: () => console.log("Delete brand:", row.original._id),
          }}
        />
      );
    },
  },
];
