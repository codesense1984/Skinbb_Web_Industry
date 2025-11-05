import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatChartCard } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/core/components/ui/alert";
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
  ExclamationCircleIcon
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

export const PendingBrandOnboardingsCard: React.FC<PendingBrandOnboardingsCardProps> = ({ 
  className 
}) => {
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const pendingCount = onboardings.filter((b) => b.status === "pending" || b.status === "review").length;

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BuildingOfficeIcon className="h-5 w-5" />
            Pending Brand Onboardings
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-100 text-yellow-700">
              {pendingCount} Pending
            </Badge>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              <EyeIcon className="h-4 w-4 mr-1" />
              View All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {onboardings.map((brand) => (
          <div
            key={brand.id}
            className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {brand.brandName}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Submitted by {brand.submittedBy}
                </p>
              </div>
              <Badge className={cn("text-xs", getStatusColor(brand.status))}>
                {brand.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ClockIcon className="h-3 w-3" />
                {formatDate(brand.submittedDate)}
              </div>
              <span className="text-xs text-gray-500">{brand.documents} documents</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
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

export const ApiIntegrationStatusCard: React.FC<ApiIntegrationStatusCardProps> = ({ className }) => {
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
        return <ExclamationCircleIcon className="h-4 w-4 text-gray-500" />;
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

  const connectedCount = integrations.filter((i) => i.status === "connected").length;
  const totalCount = integrations.length;

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            API / Integration Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700">
              {connectedCount}/{totalCount} Connected
            </Badge>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              <EyeIcon className="h-4 w-4 mr-1" />
              View All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getHealthIcon(integration.health)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {integration.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{integration.type}</p>
                </div>
              </div>
              <Badge className={cn("text-xs", getStatusColor(integration.status))}>
                {integration.status}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
              <ClockIcon className="h-3 w-3" />
              Last sync: {formatTimestamp(integration.lastSync)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
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

export const RecentNotificationsCard: React.FC<RecentNotificationsCardProps> = ({ className }) => {
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
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BellIcon className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge className="bg-blue-100 text-blue-700">
                {unreadCount} New
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              <EyeIcon className="h-4 w-4 mr-1" />
              View All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
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
              "p-3 cursor-pointer hover:opacity-80 transition-opacity",
              !notification.read && "ring-2 ring-blue-200"
            )}
          >
            <AlertTitle className="text-sm font-medium">{notification.title}</AlertTitle>
            <AlertDescription className="text-xs mt-1">
              {notification.message}
            </AlertDescription>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
              <ClockIcon className="h-3 w-3" />
              {formatTimestamp(notification.timestamp)}
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
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

export const SystemHealthCheckCard: React.FC<SystemHealthCheckCardProps> = ({ className }) => {
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

  const criticalCount = healthIssues.filter((i) => i.severity === "critical" || i.severity === "high").length;
  const openCount = healthIssues.filter((i) => i.status === "open").length;

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5" />
            System Health Check
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge className="bg-red-100 text-red-700">
                {criticalCount} Critical
              </Badge>
            )}
            {openCount > 0 && (
              <Badge className="bg-yellow-100 text-yellow-700">
                {openCount} Open
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              <EyeIcon className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {healthIssues.map((issue) => (
          <Alert
            key={issue.id}
            variant={issue.type === "error" ? "destructive" : issue.type === "warning" ? "warning" : "info"}
            className="p-3"
          >
            <div className="flex items-start gap-2">
              <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", getSeverityColor(issue.severity))} />
              <div className="flex-1 min-w-0">
                <AlertTitle className="text-sm font-medium flex items-center gap-2">
                  {issue.title}
                  <Badge variant="outline" className="text-xs capitalize">
                    {issue.severity}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {issue.status}
                  </Badge>
                </AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {issue.description}
                </AlertDescription>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                  <ClockIcon className="h-3 w-3" />
                  {formatTimestamp(issue.timestamp)}
                </div>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
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

export const AdminActivitySummaryCard: React.FC<AdminActivitySummaryCardProps> = ({ className }) => {
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
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Admin Activity Summary
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{activity.adminName}</p>
                  <Badge className={cn("text-xs", getStatusColor(activity.status))}>
                    {activity.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-medium">{activity.action}</span> {activity.target}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ClockIcon className="h-3 w-3" />
                {formatTimestamp(activity.timestamp)}
              </div>
              <span className="text-xs text-gray-400">{activity.ipAddress}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
