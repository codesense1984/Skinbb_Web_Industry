import { DataView, type ServerDataFetcher } from "@/core/components/data-view";
import { TableAction } from "@/core/components/data-table/components/table-action";
import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { ConfirmationDialog } from "@/core/components/ui/alert-dialog";
import type { PaginationParams } from "@/core/types";
import { formatDate } from "@/core/utils/date";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { DEFAULT_PAGE_SIZE } from "@/modules/panel/components/data-view";
import {
  apiGetPromotions,
  apiTogglePromotionStatus,
  apiDeletePromotion,
} from "@/modules/panel/services/http/promotion.service";
import type {
  Promotion,
  PromotionListParams,
} from "@/modules/panel/types/promotion.type";
import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { useDataView } from "@/core/components/data-view";
import type { FilterOption } from "@/core/components/dynamic-filter";
import { FilterDataItem } from "@/core/components/dynamic-filter";

// Promotion fetcher for DataView component
const createPromotionFetcher = (): ServerDataFetcher<Promotion> => {
  return async ({
    pageIndex,
    pageSize,
    sorting,
    globalFilter,
    filters,
    signal,
  }) => {
    const params: PromotionListParams = {
      page: pageIndex + 1, // API uses 1-based pagination
      limit: pageSize,
    };

    if (globalFilter) {
      params.search = globalFilter;
    }

    if (sorting.length > 0) {
      params.sortBy = sorting[0].id;
      params.sortOrder = sorting[0].desc ? "desc" : "asc";
    }

    // Map filters to API params
    if (filters.placement?.[0]?.value) {
      params.placement = filters.placement[0].value as any;
    }
    if (filters.isActive?.[0]?.value !== undefined) {
      params.isActive = filters.isActive[0].value === "true";
    }
    if (filters.promotionType?.[0]?.value) {
      params.promotionType = filters.promotionType[0].value as any;
    }
    if (filters.startDate?.[0]?.value) {
      params.startDate = filters.startDate[0].value;
    }
    if (filters.endDate?.[0]?.value) {
      params.endDate = filters.endDate[0].value;
    }

    const response = await apiGetPromotions(params, signal);

    if (response?.success && response.data) {
      return {
        rows: response.data.promotions || [],
        total: response.data.pagination?.totalRecords || 0,
      };
    }

    return { rows: [], total: 0 };
  };
};

// Filter options
const PLACEMENT_OPTIONS: FilterOption[] = [
  { label: "Home Hero", value: "home-hero" },
  { label: "Home Strip", value: "home-strip" },
  { label: "Brand Page", value: "brand-page" },
  { label: "Category Page", value: "category-page" },
  { label: "Product Page", value: "product-page" },
];

const PROMOTION_TYPE_OPTIONS: FilterOption[] = [
  { label: "Banner", value: "banner" },
  { label: "Curated Stores", value: "curated-stores" },
];

const STATUS_OPTIONS: FilterOption[] = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

// Filter components
const PromotionFilters = () => {
  return (
    <>
      <FilterDataItem
        dataKey="placement"
        type="dropdown"
        mode="single"
        options={PLACEMENT_OPTIONS}
        placeholder="Select placement..."
      />
      <FilterDataItem
        dataKey="promotionType"
        type="dropdown"
        mode="single"
        options={PROMOTION_TYPE_OPTIONS}
        placeholder="Select type..."
      />
      <FilterDataItem
        dataKey="isActive"
        type="dropdown"
        mode="single"
        options={STATUS_OPTIONS}
        placeholder="Select status..."
      />
      <FilterDataItem
        dataKey="startDate"
        type="date"
        mode="single"
        placeholder="Start date..."
      />
      <FilterDataItem
        dataKey="endDate"
        type="date"
        mode="single"
        placeholder="End date..."
      />
    </>
  );
};

// Columns definition
const getColumns = (
  onToggleStatus: (id: string) => void,
  onDelete: (id: string) => void,
) => [
  {
    header: "Image",
    accessorKey: "imageUrl",
    cell: ({ row }: { row: { original: Promotion } }) => {
      const imageUrl = row.original.imageUrl;
      return (
        <div className="flex items-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={row.original.imageAltText || row.original.title}
              className="h-12 w-12 rounded object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-gray-400">
              No Image
            </div>
          )}
        </div>
      );
    },
  },
  {
    header: "Title",
    accessorKey: "title",
    cell: ({ row }: { row: { original: Promotion } }) => (
      <div>
        <div className="font-medium text-gray-900">{row.original.title}</div>
        {row.original.subtitle && (
          <div className="text-sm text-gray-500">{row.original.subtitle}</div>
        )}
      </div>
    ),
  },
  {
    header: "Placement",
    accessorKey: "placement",
    cell: ({ row }: { row: { original: Promotion } }) => {
      const placement = row.original.placement;
      const placementLabels: Record<string, string> = {
        "home-hero": "Home Hero",
        "home-strip": "Home Strip",
        "brand-page": "Brand Page",
        "category-page": "Category Page",
        "product-page": "Product Page",
      };
      return (
        <div className="text-sm text-gray-900">
          {placementLabels[placement] || placement}
        </div>
      );
    },
  },
  {
    header: "Type",
    accessorKey: "promotionType",
    cell: ({ row }: { row: { original: Promotion } }) => {
      const type = row.original.promotionType;
      return (
        <div className="text-sm text-gray-900 capitalize">
          {type === "curated-stores" ? "Curated Stores" : "Banner"}
        </div>
      );
    },
  },
  {
    header: "Priority",
    accessorKey: "priority",
    cell: ({ row }: { row: { original: Promotion } }) => (
      <div className="text-sm text-gray-900">{row.original.priority}</div>
    ),
  },
  {
    header: "Start Date",
    accessorKey: "startAt",
    cell: ({ row }: { row: { original: Promotion } }) => (
      <div className="text-sm text-gray-500">
        {formatDate(row.original.startAt)}
      </div>
    ),
  },
  {
    header: "End Date",
    accessorKey: "endAt",
    cell: ({ row }: { row: { original: Promotion } }) => (
      <div className="text-sm text-gray-500">
        {formatDate(row.original.endAt)}
      </div>
    ),
  },
  {
    header: "Status",
    accessorKey: "isActive",
    cell: ({ row }: { row: { original: Promotion } }) => {
      const isActive = row.original.isActive;
      return (
        <StatusBadge
          module="promotion"
          status={isActive ? "active" : "inactive"}
          variant="badge"
        >
          {isActive ? "Active" : "Inactive"}
        </StatusBadge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: Promotion } }) => {
      const promotion = row.original;
      return (
        <TableAction
          view={{
            to: PANEL_ROUTES.PROMOTION.VIEW(promotion._id),
            title: "View promotion details",
          }}
          edit={{
            to: PANEL_ROUTES.PROMOTION.EDIT(promotion._id),
            title: "Edit promotion",
          }}
          delete={{
            onClick: () => onDelete(promotion._id),
            title: "Delete promotion",
          }}
        />
      );
    },
  },
];

// Promotion Card Component
const PromotionCard = ({ promotion }: { promotion: Promotion }) => {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3">
        {promotion.imageUrl ? (
          <img
            src={promotion.imageUrl}
            alt={promotion.imageAltText || promotion.title}
            className="h-40 w-full rounded object-cover"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center rounded bg-gray-100 text-gray-400">
            No Image
          </div>
        )}
      </div>
      <h3 className="mb-1 font-semibold text-gray-900">{promotion.title}</h3>
      {promotion.subtitle && (
        <p className="mb-2 text-sm text-gray-500">{promotion.subtitle}</p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <StatusBadge
          module="promotion"
          status={promotion.isActive ? "active" : "inactive"}
          variant="badge"
        >
          {promotion.isActive ? "Active" : "Inactive"}
        </StatusBadge>
        <span className="text-xs text-gray-500">
          {formatDate(promotion.startAt)}
        </span>
      </div>
    </div>
  );
};

// Main component
const PromotionList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const promotionFetcher = useMemo(() => createPromotionFetcher(), []);

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(null);

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: apiTogglePromotionStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.PROMOTION.LIST],
      });
      toast.success("Promotion status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update promotion status");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: apiDeletePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.PROMOTION.LIST],
      });
      toast.success("Promotion deleted successfully");
      setDeleteDialogOpen(false);
      setPromotionToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete promotion");
    },
  });

  const handleToggleStatus = (id: string) => {
    toggleStatusMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    setPromotionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (promotionToDelete) {
      deleteMutation.mutate(promotionToDelete);
    }
  };

  // Create columns with handlers
  const columns = useMemo(
    () => getColumns(handleToggleStatus, handleDelete),
    [handleToggleStatus, handleDelete],
  );

  const renderCard = useMemo(
    () => (promotion: Promotion) => (
      <NavLink to={PANEL_ROUTES.PROMOTION.VIEW(promotion._id)}>
        <PromotionCard promotion={promotion} />
      </NavLink>
    ),
    [],
  );

  return (
    <PageContent
      header={{
        title: "Promotions",
        description: "Manage promotional banners and curated stores",
        actions: (
          <Button color="primary" asChild>
            <NavLink to={PANEL_ROUTES.PROMOTION.CREATE}>
              Create Promotion
            </NavLink>
          </Button>
        ),
      }}
    >
      <div className="w-full">
        <DataView<Promotion>
          fetcher={promotionFetcher}
          columns={columns}
          renderCard={renderCard}
          gridClassName="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          defaultViewMode="table"
          defaultPageSize={DEFAULT_PAGE_SIZE}
          enableUrlSync={false}
          queryKeyPrefix={PANEL_ROUTES.PROMOTION.LIST}
          searchPlaceholder="Search promotions..."
          filters={<PromotionFilters />}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPromotionToDelete(null);
        }}
        title="Delete Promotion"
        description="Are you sure you want to delete this promotion? This action cannot be undone."
        actionButtons={[
          {
            label: "Delete",
            onClick: confirmDelete,
            variant: "contained",
            color: "error",
            disabled: deleteMutation.isPending,
          },
        ]}
        showCancel={true}
        cancelText="Cancel"
      />
    </PageContent>
  );
};

export default PromotionList;

