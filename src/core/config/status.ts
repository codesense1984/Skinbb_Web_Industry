export type ModuleType =
  | "brand"
  | "survey"
  | "product"
  | "survey_user"
  | "company"
  | "company_user"
  | "customer";

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
      textColor: "text-blue-700",
      bgColor: "bg-blue-100",
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

  company_user: {
    active: {
      label: "Active",
      value: "active",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-100",
    },
    inactive: {
      label: "Inactive",
      value: "inactive",
      textColor: "text-red-700",
      bgColor: "bg-red-100",
    },
  },
  product: {
    draft: {
      label: "Draft",
      value: "draft",
      textColor: "text-gray-700",
      bgColor: "bg-gray-100",
    },
    publish: {
      label: "Published",
      value: "publish",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-100",
    },
    pending: {
      label: "Pending",
      value: "pending",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-100",
    },
    inactive: {
      label: "Inactive",
      value: "inactive",
      textColor: "text-red-700",
      bgColor: "bg-red-100",
    },
  },

  customer: {
    active: {
      label: "Active",
      value: "active",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-100",
    },
    inactive: {
      label: "Inactive",
      value: "inactive",
      textColor: "text-gray-700",
      bgColor: "bg-gray-100",
    },
    suspended: {
      label: "Suspended",
      value: "suspended",
      textColor: "text-orange-700",
      bgColor: "bg-orange-100",
    },
    blocked: {
      label: "Blocked",
      value: "blocked",
      textColor: "text-red-700",
      bgColor: "bg-red-100",
    },
  },
};
