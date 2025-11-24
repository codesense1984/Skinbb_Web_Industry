import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { StatusBadge } from "@/core/components/ui/badge";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import {
  apiGetCatalogDetail,
  apiApproveCatalog,
  apiDownloadCatalog,
  type CatalogJob,
} from "@/modules/panel/services/http/product.service";
import {
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const CatalogDetail: React.FC = () => {
  const { importJobId } = useParams<{ importJobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch catalog detail
  const {
    data: catalogData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["catalog-detail", importJobId],
    queryFn: () => apiGetCatalogDetail(importJobId!),
    enabled: !!importJobId,
  });

  // Approve catalog mutation
  const approveMutation = useMutation({
    mutationFn: (data?: { reason?: string }) => {
      if (!importJobId) {
        throw new Error("Import job ID is required");
      }
      return apiApproveCatalog(importJobId, data);
    },
    onSuccess: () => {
      toast.success("Catalog approved successfully!");
      queryClient.invalidateQueries({
        queryKey: ["catalog-detail", importJobId],
      });
      queryClient.invalidateQueries({ queryKey: ["catalog-list"] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : error instanceof Error
            ? error.message
            : "Failed to approve catalog";
      toast.error("Approval failed", { description: errorMessage });
    },
  });

  // Download catalog mutation
  const downloadMutation = useMutation({
    mutationFn: apiDownloadCatalog,
    onSuccess: (response) => {
      console.log("Download response:", response);
      // Check multiple possible response structures
      let downloadUrl = null;

      if (response?.data?.downloadUrl) {
        downloadUrl = response.data.downloadUrl;
      } else if (
        (response as unknown as Record<string, unknown>)?.downloadUrl
      ) {
        downloadUrl = (response as unknown as Record<string, unknown>)
          .downloadUrl as string;
      } else if (
        (response as unknown as Record<string, unknown>)?.data &&
        (
          (response as unknown as Record<string, unknown>).data as Record<
            string,
            unknown
          >
        )?.url
      ) {
        downloadUrl = (
          (response as unknown as Record<string, unknown>).data as Record<
            string,
            unknown
          >
        ).url as string;
      } else if ((response as unknown as Record<string, unknown>)?.url) {
        downloadUrl = (response as unknown as Record<string, unknown>)
          .url as string;
      }

      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
        toast.success("Download started!");
      } else {
        console.error("Download URL not found in response:", response);
        toast.error("Download failed", {
          description: "Download URL not found in response",
        });
      }
    },
    onError: (error: unknown) => {
      console.error("Download error:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Failed to download catalog";
      toast.error("Download failed", { description: errorMessage });
    },
  });

  if (isLoading) {
    return (
      <PageContent
        header={{
          title: "Catalog Detail",
          description: "Loading catalog details...",
        }}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Clock className="text-muted-foreground mx-auto mb-4 h-12 w-12 animate-spin" />
            <h3 className="text-lg font-medium">Loading...</h3>
          </div>
        </div>
      </PageContent>
    );
  }

  if (error || !catalogData?.data) {
    return (
      <PageContent
        header={{
          title: "Catalog Detail",
          description: "Failed to load catalog details",
        }}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <AlertCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="text-lg font-medium">Failed to load catalog</h3>
            <p className="text-muted-foreground">Please try again later.</p>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </PageContent>
    );
  }

  const catalog: CatalogJob = catalogData.data;

  // Status badge component
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "default" as const, icon: Clock, label: "Pending" },
      processing: {
        variant: "default" as const,
        icon: Clock,
        label: "Processing",
      },
      completed: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "Completed",
      },
      failed: { variant: "default" as const, icon: XCircle, label: "Failed" },
      approved: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "Approved",
      },
      rejected: {
        variant: "default" as const,
        icon: XCircle,
        label: "Rejected",
      },
    };

    const statusInfo =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <div className="flex gap-2">
        <StatusBadge module="product" status={catalog.status} variant="badge">
          <statusInfo.icon className="mr-1 h-4 w-4" />
          {statusInfo.label}
        </StatusBadge>
        {catalog.errorMessage && (
          <div className="mt-1 text-xs text-red-600">
            Reason: {catalog.errorMessage}
          </div>
        )}
      </div>
    );
  };

  return (
    <PageContent
      header={{
        title: "Catalog Detail",
        description: `Details for ${catalog.fileName}`,
        actions: (
          <div className="flex gap-2">
            <Button variant="outlined" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                // Try API download first, fallback to direct fileUrl
                if (catalog.fileUrl) {
                  // Direct download fallback
                  window.open(catalog.fileUrl, "_blank");
                  toast.success("Download started!");
                } else {
                  // Use API download
                  downloadMutation.mutate(catalog._id);
                }
              }}
              disabled={downloadMutation.isPending}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            {catalog.status === "completed" && (
              <Button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Import
              </Button>
            )}
          </div>
        ),
      }}
    >
      <div className="space-y-6">
        {/* Status and Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Import Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge(catalog.status)}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  File Name
                </div>
                <div className="font-medium">{catalog.fileName}</div>
              </div>

              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  Created
                </div>
                <div className="font-medium">
                  {format(new Date(catalog.createdAt), "MMM dd, yyyy HH:mm")}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  User ID
                </div>
                <div className="font-mono text-sm font-medium">
                  {catalog.userId}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Import Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="text-primary text-2xl font-bold">
                  {catalog.totalRows}
                </div>
                <div className="text-muted-foreground text-sm">Total Rows</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {catalog.importedCount}
                </div>
                <div className="text-muted-foreground text-sm">Imported</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {catalog.failedCount}
                </div>
                <div className="text-muted-foreground text-sm">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div>
                  <div className="font-medium">Created</div>
                  <div className="text-muted-foreground text-sm">
                    {format(new Date(catalog.createdAt), "MMM dd, yyyy HH:mm")}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Errors */}
        {catalog.errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="mb-2 font-medium">Error Message:</div>
              <div className="text-sm">{catalog.errorMessage}</div>
            </AlertDescription>
          </Alert>
        )}

        {/* File Information */}
        <Card>
          <CardHeader>
            <CardTitle>File Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {catalog.fileUrl && (
                <div>
                  <div className="text-muted-foreground mb-1 text-sm">
                    File URL
                  </div>
                  <div className="font-mono text-sm break-all">
                    {catalog.fileUrl}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="text-muted-foreground mb-1 text-sm">
                    Category ID
                  </div>
                  <div className="font-mono text-sm">{catalog.categoryId}</div>
                </div>

                <div>
                  <div className="text-muted-foreground mb-1 text-sm">
                    Company ID
                  </div>
                  <div className="font-mono text-sm">{catalog.sellerId}</div>
                </div>
              </div>

              <div>
                <div className="text-muted-foreground mb-1 text-sm">
                  Seller ID
                </div>
                <div className="font-mono text-sm">{catalog.sellerId}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
};

export default CatalogDetail;
