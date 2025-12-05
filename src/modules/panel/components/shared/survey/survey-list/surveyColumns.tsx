import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import {
  DropdownMenu,
  type DropdownMenuItemType,
} from "@/core/components/ui/dropdown-menu";
import { formatCurrency, formatDate, formatNumber } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { Survey } from "@/modules/panel/types/survey.types";
import type { ColumnDef } from "@tanstack/react-table";
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

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
        <StatusBadge
          module="survey"
          status={row.original.status}
          variant="badge"
        >
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
    {
      header: "Action",
      accessorKey: "actions",
      enableSorting: false,
      enableHiding: false,
      size: 80,
      cell: ({ row }: { row: { original: Survey } }) => {
        const survey = row.original;
        const surveyId = survey._id;
        const canEdit = survey.status === "draft";
        const isPaid = survey.paymentStatus === "paid";
        const isAdmin = !isSellerRoute;
        const viewUrl = canEdit ? editRoute(surveyId) : detailRoute(surveyId);
        const editUrl = editRoute(surveyId);

        const items: DropdownMenuItemType[] = [
          {
            type: "link",
            to: viewUrl,
            title: "View survey details",
            children: (
              <>
                <EyeIcon className="size-4" /> View
              </>
            ),
          },
        ];

        if ((canEdit && !isPaid) || isAdmin) {
          items.push({
            type: "link",
            to: editUrl,
            title: "Edit survey",
            children: (
              <>
                <PencilIcon className="size-4" /> Edit
              </>
            ),
          });
        }

        if (handleDeleteSurvey && !isPaid) {
          items.push({
            type: "item",
            onClick: () => handleDeleteSurvey(surveyId),
            variant: "destructive",
            children: (
              <>
                <TrashIcon className="size-4" /> Delete
              </>
            ),
          });
        }

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
};
