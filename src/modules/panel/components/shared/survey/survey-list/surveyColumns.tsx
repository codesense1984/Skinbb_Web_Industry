import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import {
  DropdownMenu,
  type DropdownMenuItemType,
} from "@/core/components/ui/dropdown-menu";
import { formatCurrency, formatDate, formatNumber } from "@/core/utils";
import type { Survey } from "@/modules/panel/types/survey.types";
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import type { ColumnDef } from "@tanstack/react-table";
import type { FC } from "react";

interface SurveyActionsProps {
  survey: Survey;
  handleDeleteSurvey?: (id: string) => void;
  viewUrl?: (id: string) => string;
  editUrl?: (id: string) => string;
  isAdmin: boolean;
}

export const SurveyActions: FC<SurveyActionsProps> = ({
  survey,
  handleDeleteSurvey,
  viewUrl,
  editUrl,
  isAdmin,
}) => {
  const surveyId = survey._id;
  const canEdit = survey.status === "draft";
  const isPaid = survey.paymentStatus === "paid";

  const items: DropdownMenuItemType[] = [
    {
      type: "link",
      to: viewUrl?.(surveyId) || "",
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
      to: editUrl?.(surveyId) || "",
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
      <Button variant="ghost" className="size-7">
        <EllipsisVerticalIcon className="size-4" />
      </Button>
    </DropdownMenu>
  );
};

export const createSurveyColumns = ({
  handleDeleteSurvey,
  viewUrl,
  editUrl,
  isAdmin,
}: {
  handleDeleteSurvey?: (id: string) => void;
  viewUrl?: (id: string) => string;
  editUrl?: (id: string) => string;
  isAdmin: boolean;
}): ColumnDef<Survey>[] => {
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
      cell: ({ row }: { row: { original: Survey } }) => (
        <SurveyActions
          survey={row.original}
          handleDeleteSurvey={handleDeleteSurvey}
          viewUrl={viewUrl}
          editUrl={editUrl}
          isAdmin={isAdmin}
        />
      ),
    },
  ];
};
