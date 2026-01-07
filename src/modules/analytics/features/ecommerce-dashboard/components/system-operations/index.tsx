import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { StatChartCard } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/core/components/ui/alert";
import {
  BuildingOfficeIcon,
  LinkIcon,
  BellIcon,
  ExclamationTriangleIcon,
  UserIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { api } from "@/core/services/http";

// Pending Brand Onboardings Card (Status Tile)
interface BrandOnboarding {
  id: string;
  brandName: string;
  submittedBy: string;
  submittedDate: string;
  status: "pending" | "review" | "approved" | "rejected";
  documents: number;
}

interface PendingBrandOnboardingsCardProps {
  className?: string;
}

export const PendingBrandOnboardingsCard: React.FC<
  PendingBrandOnboardingsCardProps
> = ({ className }) => {
  // Mock data - replace with actual API call to ENDPOINTS.BRAND.MAIN
  const onboardings: BrandOnboarding[] = [
    {
      id: "1",
      brandName: "Natural Glow Skincare",
      submittedBy: "john.doe@example.com",
      submittedDate: "2024-01-12",
      status: "pending",
      documents: 5,
    },
    {
      id: "2",
      brandName: "Eco Beauty Solutions",
      submittedBy: "jane.smith@example.com",
      submittedDate: "2024-01-10",
      status: "review",
      documents: 7,
    },
    {
      id: "3",
      brandName: "Premium Cosmetics Ltd",
      submittedBy: "admin@premium.com",
      submittedDate: "2024-01-08",
      status: "pending",
      documents: 4,
    },
    {
      id: "4",
      brandName: "Organic Skin Care Co",
      submittedBy: "contact@organic.com",
      submittedDate: "2024-01-05",
      status: "review",
      documents: 6,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "review":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "approved":
        return "bg-green-100 text-green-700 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const pendingCount = onboardings.filter(
    (b) => b.status === "pending" || b.status === "review",
  ).length;

  return (
    <StatChartCard
      name={
        <div className="flex items-center gap-2">
          <BuildingOfficeIcon className="h-5 w-5" />
          Pending Brand Onboardings
        </div>
      }
      className={cn("md:max-h-auto", className)}
      actions={
        <Badge className="bg-yellow-100 text-xs text-yellow-700">
          {pendingCount} Pending
        </Badge>
      }
    >
      <div className="space-y-4">
        {onboardings.map((brand) => (
          <div
            key={brand.id}
            className="rounded-lg border border-gray-100 p-3 transition-colors"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground truncate font-medium">
                  {brand.brandName}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Submitted by {brand.submittedBy}
                </p>
              </div>
              <Badge
                className={cn(
                  "text-xs capitalize",
                  getStatusColor(brand.status),
                )}
              >
                {brand.status}
              </Badge>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                <ClockIcon className="h-4 w-4" />
                {formatDate(brand.submittedDate)}
              </div>
              <span className="text-muted-foreground text-sm">
                {brand.documents} documents
              </span>
            </div>
          </div>
        ))}
      </div>
    </StatChartCard>
  );
};

// API / Integration Status Card (Status Tile)
interface Integration {
  id: string;
  name: string;
  type: "payment" | "shipping" | "analytics" | "marketing" | "inventory";
  status: "connected" | "disconnected" | "error" | "pending";
  lastSync: string;
  health: "healthy" | "warning" | "error";
}

interface ApiIntegrationStatusCardProps {
  className?: string;
}

export const ApiIntegrationStatusCard: React.FC<
  ApiIntegrationStatusCardProps
> = ({ className }) => {
  // Mock data - replace with actual API call
  const integrations: Integration[] = [
    {
      id: "1",
      name: "Stripe Payment",
      type: "payment",
      status: "connected",
      lastSync: "2024-01-15T10:30:00",
      health: "healthy",
    },
    {
      id: "2",
      name: "FedEx Shipping",
      type: "shipping",
      status: "connected",
      lastSync: "2024-01-15T09:15:00",
      health: "healthy",
    },
    {
      id: "3",
      name: "Google Analytics",
      type: "analytics",
      status: "error",
      lastSync: "2024-01-14T15:20:00",
      health: "error",
    },
    {
      id: "4",
      name: "Mailchimp",
      type: "marketing",
      status: "connected",
      lastSync: "2024-01-15T11:00:00",
      health: "warning",
    },
    {
      id: "5",
      name: "Inventory System",
      type: "inventory",
      status: "connected",
      lastSync: "2024-01-15T10:45:00",
      health: "healthy",
    },
  ];

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "healthy":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return (
          <ExclamationCircleIcon className="text-muted-foreground h-4 w-4" />
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-700";
      case "disconnected":
        return "bg-gray-100 text-gray-700";
      case "error":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const connectedCount = integrations.filter(
    (i) => i.status === "connected",
  ).length;
  const totalCount = integrations.length;

  return (
    <StatChartCard
      name={
        <div className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          API / Integration Status
        </div>
      }
      className={cn("md:max-h-auto", className)}
      actions={
        <Badge className="bg-green-100 text-xs text-green-700">
          {connectedCount}/{totalCount} Connected
        </Badge>
      }
    >
      <div className="space-y-4">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {getHealthIcon(integration.health)}
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground truncate font-medium">
                    {integration.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground flex items-center gap-1 text-sm capitalize">
                      <CreditCardIcon className="h-4 w-4" />
                      {integration.type}
                    </p>
                    <div className="text-muted-foreground flex items-center gap-1 text-sm">
                      <ClockIcon className="h-4 w-4" />
                      Last sync: {formatTimestamp(integration.lastSync)}
                    </div>
                  </div>
                </div>
              </div>
              <Badge
                className={cn(
                  "text-xs capitalize",
                  getStatusColor(integration.status),
                )}
              >
                {integration.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </StatChartCard>
  );
};

// Recent Notifications Card (Feed Tile)
interface Notification {
  id: string;
  type: "alert" | "info" | "warning" | "success";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface RecentNotificationsCardProps {
  className?: string;
}

export const RecentNotificationsCard: React.FC<
  RecentNotificationsCardProps
> = ({ className }) => {
  // Mock data - replace with actual API call
  const notifications: Notification[] = [
    {
      id: "1",
      type: "alert",
      title: "Low Stock Alert",
      message: "5 products are running low on inventory",
      timestamp: "2024-01-15T10:30:00",
      read: false,
    },
    {
      id: "2",
      type: "success",
      title: "Order Shipped",
      message: "Order #12345 has been shipped successfully",
      timestamp: "2024-01-15T09:15:00",
      read: false,
    },
    {
      id: "3",
      type: "warning",
      title: "Payment Failed",
      message: "Failed payment attempt for Order #12344",
      timestamp: "2024-01-15T08:45:00",
      read: true,
    },
    {
      id: "4",
      type: "info",
      title: "New Brand Application",
      message: "New brand onboarding request received",
      timestamp: "2024-01-15T07:20:00",
      read: false,
    },
    {
      id: "5",
      type: "alert",
      title: "System Backup Complete",
      message: "Daily system backup completed successfully",
      timestamp: "2024-01-14T23:00:00",
      read: true,
    },
  ];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Just now";
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <StatChartCard
      name={
        <div className="flex items-center gap-2">
          <BellIcon className="h-5 w-5" />
          Recent Notifications
        </div>
      }
      className={cn("md:max-h-auto", className)}
      actions={
        <Badge className="bg-blue-100 text-xs text-blue-700">
          {unreadCount} New
        </Badge>
      }
    >
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Alert
            key={notification.id}
            variant={
              notification.type === "alert"
                ? "destructive"
                : notification.type === "warning"
                  ? "warning"
                  : notification.type === "success"
                    ? "success"
                    : "info"
            }
            className={cn(
              "p-3",
              // !notification.read && "ring-2",
            )}
          >
            <AlertTitle className="font-medium">
              {notification.title}
            </AlertTitle>
            <AlertDescription className="text-sm">
              {notification.message}
            </AlertDescription>
            <div className="ml-6 flex w-full items-center gap-1 text-sm">
              <ClockIcon className="h-3 w-3" />
              <span className="whitespace-nowrap">
                {formatTimestamp(notification.timestamp)}
              </span>
            </div>
          </Alert>
        ))}{" "}
      </div>
    </StatChartCard>
  );
};

// System Health Check Card (Alert Tile)
interface HealthIssue {
  id: string;
  type: "error" | "warning" | "info";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  timestamp: string;
  status: "open" | "resolved" | "investigating";
}

interface SystemHealthCheckCardProps {
  className?: string;
}

export const SystemHealthCheckCard: React.FC<SystemHealthCheckCardProps> = ({
  className,
}) => {
  // Mock data - replace with actual API call
  const healthIssues: HealthIssue[] = [
    {
      id: "1",
      type: "error",
      severity: "critical",
      title: "Database Connection Timeout",
      description: "Multiple timeout errors detected in database connections",
      timestamp: "2024-01-15T10:30:00",
      status: "investigating",
    },
    {
      id: "2",
      type: "warning",
      severity: "high",
      title: "Sync Delay Detected",
      description: "Inventory sync is 2 hours behind schedule",
      timestamp: "2024-01-15T08:15:00",
      status: "open",
    },
    {
      id: "3",
      type: "warning",
      severity: "medium",
      title: "High API Error Rate",
      description: "Payment API showing 5% error rate",
      timestamp: "2024-01-15T07:45:00",
      status: "open",
    },
    {
      id: "4",
      type: "info",
      severity: "low",
      title: "Scheduled Maintenance",
      description: "System maintenance scheduled for tonight 2 AM",
      timestamp: "2024-01-15T06:00:00",
      status: "open",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const criticalCount = healthIssues.filter(
    (i) => i.severity === "critical" || i.severity === "high",
  ).length;
  const openCount = healthIssues.filter((i) => i.status === "open").length;

  return (
    <StatChartCard
      name={
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5" />
          System Health Check
        </div>
      }
      className={cn("md:max-h-auto", className)}
      actions={
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <Badge className="bg-red-100 text-xs text-red-700">
              {criticalCount} Critical
            </Badge>
          )}
          {openCount > 0 && (
            <Badge className="bg-yellow-100 text-xs text-yellow-700">
              {openCount} Open
            </Badge>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {healthIssues.map((issue) => (
          <Alert
            key={issue.id}
            variant={
              issue.type === "error"
                ? "destructive"
                : issue.type === "warning"
                  ? "warning"
                  : "info"
            }
            className="p-3"
          >
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  "mt-1.5 h-2 w-2 flex-shrink-0 rounded-full",
                  getSeverityColor(issue.severity),
                )}
              />
              <div className="min-w-0 flex-1">
                <AlertTitle className="flex items-center gap-2 text-sm font-medium">
                  {issue.title}
                  <Badge variant="outline" className="text-xs capitalize">
                    {issue.severity}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {issue.status}
                  </Badge>
                </AlertTitle>
                <AlertDescription className="mt-1 text-xs">
                  {issue.description}
                </AlertDescription>
                <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                  <ClockIcon className="h-3 w-3" />
                  {formatTimestamp(issue.timestamp)}
                </div>
              </div>
            </div>
          </Alert>
        ))}
      </div>
    </StatChartCard>
  );
};

// Admin Activity Summary Card (List Tile)
interface AdminActivity {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
  ipAddress: string;
  status: "success" | "failed" | "warning";
}

interface AdminActivitySummaryCardProps {
  className?: string;
}

export const AdminActivitySummaryCard: React.FC<
  AdminActivitySummaryCardProps
> = ({ className }) => {
  // Mock data - replace with actual API call
  const activities: AdminActivity[] = [
    {
      id: "1",
      adminName: "John Admin",
      action: "Updated",
      target: "Product: Hydrating Serum",
      timestamp: "2024-01-15T10:30:00",
      ipAddress: "192.168.1.100",
      status: "success",
    },
    {
      id: "2",
      adminName: "Sarah Manager",
      action: "Logged In",
      target: "Dashboard Access",
      timestamp: "2024-01-15T09:15:00",
      ipAddress: "192.168.1.105",
      status: "success",
    },
    {
      id: "3",
      adminName: "Mike Admin",
      action: "Created",
      target: "Brand: Natural Beauty",
      timestamp: "2024-01-15T08:45:00",
      ipAddress: "192.168.1.102",
      status: "success",
    },
    {
      id: "4",
      adminName: "Emma Admin",
      action: "Updated",
      target: "Order Status: #12345",
      timestamp: "2024-01-15T07:20:00",
      ipAddress: "192.168.1.103",
      status: "success",
    },
    {
      id: "5",
      adminName: "David Admin",
      action: "Failed Login",
      target: "Invalid Credentials",
      timestamp: "2024-01-15T06:30:00",
      ipAddress: "192.168.1.999",
      status: "failed",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "warning":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <StatChartCard
      name={
        <div className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Admin Activity Summary
        </div>
      }
      className={cn("md:max-h-auto", className)}
    >
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground font-medium">
                    {activity.adminName}
                  </p>
                  <Badge
                    className={cn("text-sm", getStatusColor(activity.status))}
                  >
                    {activity.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  <span className="font-medium">{activity.action}</span>{" "}
                  {activity.target}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                <ClockIcon className="h-3 w-3" />
                {formatTimestamp(activity.timestamp)}
              </div>
              <span className="text-sm text-gray-400">
                {activity.ipAddress}
              </span>
            </div>
          </div>
        ))}
      </div>
    </StatChartCard>
  );

  return (
    <Card className={cn("border-gray-200 bg-white", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground flex items-center gap-2 text-lg font-semibold">
            <UserIcon className="h-5 w-5" />
            Admin Activity Summary
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <EyeIcon className="mr-1 h-4 w-4" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground text-sm font-medium">
                    {activity.adminName}
                  </p>
                  <Badge
                    className={cn("text-xs", getStatusColor(activity.status))}
                  >
                    {activity.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  <span className="font-medium">{activity.action}</span>{" "}
                  {activity.target}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <ClockIcon className="h-3 w-3" />
                {formatTimestamp(activity.timestamp)}
              </div>
              <span className="text-xs text-gray-400">
                {activity.ipAddress}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
