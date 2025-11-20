import {
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
} from "@/core/components/ui/avatar";
import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import {
  DropdownMenu,
  type DropdownMenuItemType,
} from "@/core/components/ui/dropdown-menu";
import { STATUS_MAP } from "@/core/config/status";
import { formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { Brand, BrandLogoImage } from "@/modules/panel/types/brand.type";
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/solid";
import type { ColumnDef } from "@tanstack/react-table";

export const getBrandStatus = (brand: Brand): string => {
  return brand.status || (brand.isActive ? "active" : "inactive");
};

export const createBrandColumns = (
  companyId?: string,
  locationId?: string,
): ColumnDef<Brand>[] => [
  {
    accessorKey: "name",
    header: "Brand",
    cell: ({ row, getValue }) => (
      <ul className="flex min-w-40 items-center gap-2">
        <AvatarRoot className="size-10 rounded-md border">
          <AvatarImage
            className="object-contain"
            src={
              typeof row.original.logoImage === "string"
                ? row.original.logoImage
                : ((row.original.logoImage as BrandLogoImage)?.url ?? "")
            }
            alt={`${row.original.name} logo`}
          />
          <AvatarFallback className="rounded-md capitalize">
            {(getValue() as string)?.charAt(0)}
          </AvatarFallback>
        </AvatarRoot>
        <div className="flex flex-col">
          <span className="font-medium">{getValue() as string}</span>
          <span className="text-muted-foreground text-sm">
            {row.original.slug || row.original?.slug}
          </span>
        </div>
      </ul>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = getBrandStatus(row.original);
      const statusChangeReason = row.original.statusChangeReason;

      return (
        <div className="space-y-1">
          <StatusBadge module="brand" status={status} variant="badge">
            {status}
          </StatusBadge>
          {status === "rejected" && statusChangeReason && (
            <div
              className="max-w-[180px] truncate text-xs text-red-600"
              title={statusChangeReason}
            >
              Reason: {statusChangeReason}
            </div>
          )}
        </div>
      );
    },
    filterFn: (row, _id, value) => {
      const status = getBrandStatus(row.original);
      return value.includes(status);
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => {
      const createdAt = getValue() as string;
      return <div className="w-max">{formatDate(createdAt)}</div>;
    },
  },
  {
    header: "Action",
    accessorKey: "actions",
    enableSorting: false,
    enableHiding: false,
    size: 80,
    cell: ({ row }) => {
      const brandId = row.original._id;
      const companyId = row.original.companyId;
      const locationId = row.original.locationId;
      const status = getBrandStatus(row.original);
      const viewUrl =
        companyId && locationId
          ? `${PANEL_ROUTES.BRAND.VIEW(brandId)}?companyId=${companyId}&locationId=${locationId}`
          : PANEL_ROUTES.BRAND.VIEW(brandId);
      const editUrl =
        companyId && locationId
          ? `${PANEL_ROUTES.BRAND.EDIT(brandId)}?companyId=${companyId}&locationId=${locationId}`
          : PANEL_ROUTES.BRAND.EDIT(brandId);

      const items: DropdownMenuItemType[] = [
        {
          type: "link",
          to: viewUrl,
          title: "View brand details",
          children: (
            <>
              <EyeIcon className="size-4" /> View
            </>
          ),
        },
      ];

      const isApprovedBrand =
        companyId &&
        locationId &&
        ![
          STATUS_MAP.brand.pending.value,
          STATUS_MAP.brand.rejected.value,
        ].includes(status);

      if (isApprovedBrand) {
        items.push({
          type: "link",
          to: PANEL_ROUTES.COMPANY_LOCATION.BRAND_PRODUCTS(
            companyId,
            locationId,
            brandId,
          ),
          title: "View products for this brand",
          children: (
            <>
              <ShoppingBagIcon className="size-4" /> View Products
            </>
          ),
        });
      }

      items.push({
        type: "link",
        to: editUrl,
        title: "Edit brand",
        children: (
          <>
            <PencilIcon className="size-4" /> Edit
          </>
        ),
      });

      return (
        <DropdownMenu items={items}>
          <Button variant="outlined" size="icon">
            <EllipsisVerticalIcon className="size-4" />
          </Button>
        </DropdownMenu>
      );
    },
  },
];
