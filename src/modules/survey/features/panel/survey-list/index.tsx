import { TableAction } from "@/core/components/data-table/components/table-action";
import {
  DataView,
  type ServerDataFetcher,
} from "@/core/components/data-view";
import { FilterDataItem } from "@/core/components/dynamic-filter";
import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { STATUS_MAP } from "@/core/config/status";
import { formatCurrency } from "@/core/utils/number";
import { formatDate } from "@/core/utils/date";
import { useDeleteSurvey } from "@/modules/survey/hooks";
import { apiGetSurveys } from "@/modules/survey/services/survey.service";
import type { Survey, SurveyListParams } from "@/modules/survey/types/survey.types";
import { SURVEY_ROUTES } from "@/modules/survey/routes/constant";
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { DEFAULT_PAGE_SIZE } from "@/modules/panel/components/data-view";
import { SELLER_ROUTES } from "@/modules/seller/routes/constant";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

// Survey fetcher for DataView component
const createSurveyFetcher = (): ServerDataFetcher<Survey> => {
  return async ({ pageIndex, pageSize, columnFilters, globalFilter, signal }) => {
    const params: SurveyListParams = {
      page: pageIndex + 1,
      limit: pageSize,
    };

    // Apply status filter
    const statusFilter = columnFilters.find((f) => f.id === "status");
    if (statusFilter?.value) {
      params.status = statusFilter.value as Survey["status"];
    }

    // Apply type filter
    const typeFilter = columnFilters.find((f) => f.id === "type");
    if (typeFilter?.value) {
      params.type = typeFilter.value as Survey["type"];
    }

    // Apply search
    if (globalFilter) {
      params.search = globalFilter as string;
    }

    const response = await apiGetSurveys(params, signal);
    return {
      rows: response.data.surveys || [],
      total: response.data.pagination?.total || 0,
    };
  };
};

// Filter components
const SurveyFilters = () => {
  const statusOptions = Object.values(STATUS_MAP.survey);
  const typeOptions = [
    { label: "Flash", value: "flash" },
    { label: "Standard", value: "standard" },
  ];

  return (
    <>
      <FilterDataItem
        dataKey="status"
        type="dropdown"
        mode="single"
        options={statusOptions}
        placeholder="Select status..."
      />
      <FilterDataItem
        dataKey="type"
        type="dropdown"
        mode="single"
        options={typeOptions}
        placeholder="Select type..."
      />
    </>
  );
};

// Columns definition
const getColumns = (
  handleDeleteSurvey: (id: string) => void,
  isSellerRoute: boolean,
  navigate: (path: string) => void,
) => [
  {
    header: "Title",
    accessorKey: "title",
    cell: ({ row }: { row: { original: Survey } }) => (
      <div className="font-medium text-gray-900">{row.original.title}</div>
    ),
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }: { row: { original: Survey } }) => (
      <div className="text-sm text-gray-600 capitalize">
        {row.original.type}
      </div>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }: { row: { original: Survey } }) => (
      <StatusBadge module="survey" status={row.original.status} variant="badge">
        {row.original.status}
      </StatusBadge>
    ),
  },
  {
    header: "Location Target",
    accessorKey: "locationTarget",
    cell: ({ row }: { row: { original: Survey } }) => {
      const target = row.original.locationTarget;
      const city = row.original.targetCity;
      const metro = row.original.targetMetro;
      return (
        <div className="text-sm text-gray-600">
          {target === "City" && city ? `${target}: ${city}` : null}
          {target === "Metro" && metro ? `${target}: ${metro}` : null}
          {target === "All" ? "All Locations" : null}
        </div>
      );
    },
  },
  {
    header: "Reward",
    accessorKey: "reward",
    cell: ({ row }: { row: { original: Survey } }) => (
      <div className="text-sm text-gray-900">
        {row.original.reward} coins
      </div>
    ),
  },
  {
    header: "Total Price",
    accessorKey: "totalPrice",
    cell: ({ row }: { row: { original: Survey } }) => (
      <div className="text-sm text-gray-900">
        {formatCurrency(row.original.totalPrice)}
      </div>
    ),
  },
  {
    header: "Attempts",
    accessorKey: "totalAttempts",
    cell: ({ row }: { row: { original: Survey } }) => (
      <div className="text-sm text-gray-600">
        {row.original.completedAttempts}/{row.original.totalAttempts}
      </div>
    ),
  },
  {
    header: "Payment Status",
    accessorKey: "paymentStatus",
    cell: ({ row }: { row: { original: Survey } }) => (
      <StatusBadge
        module="payment"
        status={row.original.paymentStatus}
        variant="badge"
      >
        {row.original.paymentStatus}
      </StatusBadge>
    ),
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
    cell: ({ row }: { row: { original: Survey } }) => (
      <div className="text-sm text-gray-500">
        {formatDate(row.original.createdAt)}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: Survey } }) => {
      const survey = row.original;
      const canEdit = survey.status === "draft";
      
      // Use seller routes if in seller panel, otherwise use admin routes
      const getEditRoute = (id: string) => 
        isSellerRoute 
          ? SELLER_ROUTES.MARKETING.SURVEYS.EDIT(id)
          : SURVEY_ROUTES.EDIT(id);
      const getDetailRoute = (id: string) => 
        isSellerRoute 
          ? SELLER_ROUTES.MARKETING.SURVEYS.VIEW(id)
          : SURVEY_ROUTES.DETAIL(id);
      const getRespondRoute = (id: string) => 
        isSellerRoute 
          ? undefined // Sellers don't have respond route
          : SURVEY_ROUTES.RESPOND(id);
      
      return (
        <TableAction
          view={{
            to: canEdit
              ? getEditRoute(survey._id)
              : getDetailRoute(survey._id),
            title: canEdit ? "Edit survey" : "View survey details",
          }}
          delete={{
            onClick: () => handleDeleteSurvey(survey._id),
            title: "Delete survey",
          }}
        >
          {!isSellerRoute && getRespondRoute(survey._id) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(getRespondRoute(survey._id)!)}
              title="Respond to survey"
            >
              <PencilSquareIcon className="h-4 w-4" />
            </Button>
          )}
        </TableAction>
      );
    },
  },
];

// Main component
const SurveyList = () => {
  const deleteSurveyMutation = useDeleteSurvey();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Detect if we're in seller routes
  const isSellerRoute = location.pathname.includes("/marketing/surveys");

  const surveyFetcher = useMemo(() => createSurveyFetcher(), []);

  const handleDeleteSurvey = useCallback(
    (id: string) => {
      if (
        window.confirm(
          "Are you sure you want to delete this survey? This action cannot be undone.",
        )
      ) {
        deleteSurveyMutation.mutate(id);
      }
    },
    [deleteSurveyMutation],
  );

  const columns = useMemo(
    () => getColumns(handleDeleteSurvey, isSellerRoute, navigate),
    [handleDeleteSurvey, isSellerRoute, navigate],
  );

  return (
    <PageContent
      header={{
        title: "Surveys",
        description: "Manage and track all your surveys",
        actions: (
          <Button color={"primary"} asChild>
            <a href={isSellerRoute ? SELLER_ROUTES.MARKETING.SURVEYS.CREATE : SURVEY_ROUTES.CREATE}>
              Create Survey
            </a>
          </Button>
        ),
      }}
    >
      <div className="w-full">
        <DataView<Survey>
          fetcher={surveyFetcher}
          columns={columns}
          defaultViewMode="table"
          defaultPageSize={DEFAULT_PAGE_SIZE}
          enableUrlSync={false}
          queryKeyPrefix={SURVEY_ROUTES.LIST}
          searchPlaceholder="Search surveys..."
          filters={<SurveyFilters />}
        />
      </div>
    </PageContent>
  );
};

export default SurveyList;

