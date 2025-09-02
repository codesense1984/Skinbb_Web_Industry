export type ModuleType =
  | "brand"
  | "survey"
  | "product"
  | "survey_user"
  | "company";

export interface StatusStyle {
  label: string;
  textColor?: string;
  bgColor?: string;
  value: string;
}

export const STATUS_MAP: Record<ModuleType, Record<string, StatusStyle>> = {
  brand: {
    active: {
      label: "Active",
      value: "active",
      textColor: "text-blue-700",
      bgColor: "bg-blue-100",
    },
    inactive: {
      label: "Inactive",
      value: "inactive",
      textColor: "text-gray-700",
      bgColor: "bg-gray-200",
    },
    closed: {
      label: "Closed",
      value: "closed",
      textColor: "text-red-700",
      bgColor: "bg-red-100",
    },
    suspended: {
      label: "Suspended",
      value: "suspended",
      textColor: "text-orange-700",
      bgColor: "bg-orange-100",
    },
    pending_approval: {
      label: "Pending Approval",
      value: "pending_approval",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-100",
    },
  },
  company: {
    approved: {
      label: "Approved",
      value: "approved",
      textColor: "text-indigo-700",
      bgColor: "bg-indigo-100",
    },
    pending: {
      label: "Pending",
      value: "pending",
      textColor: "text-gray-700",
      bgColor: "bg-gray-100",
    },
    rejected: {
      label: "Rejected",
      value: "rejected",
      textColor: "text-red-700",
      bgColor: "bg-red-100 ",
    },
    "in-progress": {
      label: "In Progress",
      value: "in-progress",
      textColor: "text-blue-700",
      bgColor: "bg-blue-100",
    },
  },

  survey: {
    draft: {
      label: "Draft",
      value: "draft",
      textColor: "text-gray-700",
      bgColor: "bg-gray-100",
    },
    running: {
      label: "Running",
      value: "running",
      textColor: "text-green-700",
      bgColor: "bg-green-100",
    },
    completed: {
      label: "Completed",
      value: "completed",
      textColor: "text-indigo-700",
      bgColor: "bg-indigo-100",
    },
    paused: {
      label: "Paused",
      value: "paused",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-100",
    },
    cancelled: {
      label: "Cancelled",
      value: "cancelled",
      textColor: "text-red-700",
      bgColor: "bg-red-100",
    },
    scheduled: {
      label: "Scheduled",
      value: "scheduled",
      textColor: "text-blue-700",
      bgColor: "bg-blue-100",
    },
    active: {
      label: "Active",
      value: "active",
      textColor: "text-blue-700",
      bgColor: "bg-blue-100",
    },
    inactive: {
      label: "Inactive",
      value: "inactive",
      textColor: "text-gray-700",
      bgColor: "bg-gray-200",
    },
    closed: {
      label: "Closed",
      value: "closed",
      textColor: "text-red-700",
      bgColor: "bg-red-100",
    },
  },

  survey_user: {
    responded: {
      label: "Responded",
      value: "responded",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-100",
    },
    opened: {
      label: "Opened",
      value: "opened",
      textColor: "text-blue-700",
      bgColor: "bg-blue-100",
    },
  },

  product: {
    "in-stock": {
      label: "In Stock",
      value: "in-stock",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-100",
    },
    "low-stock": {
      label: "Low Stock",
      value: "low-stock",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-100",
    },
    "out-of-stock": {
      label: "Out of Stock",
      value: "out-of-stock",
      textColor: "text-orange-700",
      bgColor: "bg-orange-100",
    },
    discontinued: {
      label: "Discontinued",
      value: "discontinued",
      textColor: "text-red-700",
      bgColor: "bg-red-100",
    },
    upcoming: {
      label: "Upcoming",
      value: "upcoming",
      textColor: "text-blue-700",
      bgColor: "bg-blue-100",
    },
    hidden: {
      label: "Hidden",
      value: "hidden",
      textColor: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  },
};
