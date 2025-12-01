import { StatusBadge } from "@/core/components/ui/badge";
import { formatCurrency, formatDate, formatNumber } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { Survey } from "@/modules/panel/types/survey.types";
import type { ColumnDef } from "@tanstack/react-table";
import { TableAction } from "@/core/components/data-table/components/table-action";

export const createSurveyColumns = (
  handleDeleteSurvey?: (id: string) => void,
  isSellerRoute?: boolean,
  getEditRoute?: (id: string) => string,
  getDetailRoute?: (id: string) => string,
): ColumnDef<Survey>[] => {
  const defaultGetEditRoute = (id: string) =>
    isSellerRoute
      ? `/marketing/surveys/${id}/edit`
      : PANEL_ROUTES.SURVEY.EDIT(id);
  const defaultGetDetailRoute = (id: string) =>
    isSellerRoute
      ? `/marketing/surveys/${id}/view`
      : PANEL_ROUTES.SURVEY.DETAIL(id);

  const editRoute = getEditRoute || defaultGetEditRoute;
  const detailRoute = getDetailRoute || defaultGetDetailRoute;

  return [
    {
      header: "Title",
      accessorKey: "title",
      cell: ({ row }: { row: { original: Survey } }) => (
        <div className="font-medium text-gray-900">{row.original.title}</div>
      ),
      meta: {
        width: 300,
      },
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: ({ row }: { row: { original: Survey } }) => (
        <div className="text-sm text-gray-600 capitalize">
          {row.original.type}
        </div>
      ),
      meta: {
        width: 100,
      },
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
      header: "EligibleRespondent",
      accessorKey: "eligibleRespondentsCount",
      cell: ({ row }: { row: { original: Survey } }) => (
        <div className="text-sm text-gray-900">
          {formatNumber(row.original?.eligibleRespondentsCount || 0)}
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
    ...(handleDeleteSurvey
      ? [
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }: { row: { original: Survey } }) => {
              const survey = row.original;
              const canEdit = survey.status === "draft";

              return (
                <TableAction
                  view={{
                    to: canEdit
                      ? editRoute(survey._id)
                      : detailRoute(survey._id),
                    title: canEdit ? "Edit survey" : "View survey details",
                  }}
                  delete={{
                    onClick: () => handleDeleteSurvey(survey._id),
                    title: "Delete survey",
                  }}
                />
              );
            },
          } as ColumnDef<Survey>,
        ]
      : []),
  ];
};

