import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { FormInput } from "@/core/components/ui/form-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Download, Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useParams, useLocation } from "react-router";
import { PaginationComboBox } from "@/core/components/ui/pagination-combo-box";
import { ComboBox } from "@/core/components/ui/combo-box";
import { createSimpleFetcher } from "@/core/components/data-table";
import { apiGetCompanyList } from "@/modules/panel/services/http/company.service";
import { apiGetBrands } from "@/modules/panel/services/http/brand.service";
import { apiBulkImportProducts, type BulkImportRequest } from "@/modules/panel/services/http/product.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/core/services/http";

interface CatalogFormData {
  category: string;
  companyId?: string;
  brandId?: string;
  templateFile: FileList;
  templateFile_files: FileList;
}

interface CategoryResponse {
  data: {
    productCategories: Array<{
      _id: string;
      name: string;
      slug: string;
      description: string;
      thumbnail: {
        url: string;
      };
    }>;
    totalRecords: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
  statusCode: number;
}

// Category API function
const apiGetCategories = async (params?: { search?: string; limit?: number; page?: number }) => {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append("search", params.search);
  if (params?.limit) searchParams.append("limit", params.limit?.toString() || "100");
  if (params?.page) searchParams.append("page", params.page?.toString() || "1");
  
  const queryString = searchParams.toString();
  const url = queryString ? `/api/v1/product-category/?${queryString}` : "/api/v1/product-category/";
  
  return api.get(url);
};

interface AddCatalogProps {
  isAdminPanel?: boolean;
}

// Remove the static category options - we'll use API data

const GUIDELINES = [
  "Choose the appropriate template from the dropdown menu and click on \"Export Template\".",
  "Ensure that you download the latest template every time you upload a new listing.",
  "Please upload the file as per the selected Category.",
  "Please do not move or realign the columns in the file.",
  "Please do not change the template name.",
  "Please do not alter or delete any individual sheet from the template file.",
  "The upper limit of the sheet is 10,000 rows only.",
  "New listings must have more than 5 styles to be uploaded.",
  "Select attribute values from the dropdown only. Copy-pasting may corrupt the template.",
];

const AddCatalog: React.FC<AddCatalogProps> = ({ isAdminPanel = false }) => {
  const { sellerInfo } = useSellerAuth();
  const { user } = useAuth();
  const params = useParams();
  const location = useLocation();
  
  // Determine if this is admin panel based on the route and user context
  // Admin context: either explicitly set, or if we have admin user but no seller info
  const isAdminContext = isAdminPanel || 
    location.pathname.includes("/panel/") || 
    location.pathname.includes("/admin/") ||
    // If we have a user but no seller info, we're likely in admin panel
    (user && !sellerInfo);

  // Get seller's primary address and first brand for seller context
  const getSellerBrandId = () => {
    if (isAdminContext || !sellerInfo) return "";
    const primaryAddress = sellerInfo.addresses?.find(addr => addr.isPrimary) || sellerInfo.addresses?.[0];
    return primaryAddress?.brands?.[0]?._id || "";
  };

  // Debug logging
  console.log("AddCatalog Debug:", {
    isAdminPanel,
    pathname: location.pathname,
    user: !!user,
    sellerInfo: !!sellerInfo,
    isAdminContext,
    includesPanel: location.pathname.includes("/panel/"),
    includesAdmin: location.pathname.includes("/admin/"),
    includesSeller: location.pathname.includes("/seller"),
    includesCompany: location.pathname.includes("/company/"),
  });
  
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const methods = useForm<CatalogFormData>({
    defaultValues: {
      category: "",
      companyId: isAdminContext ? "" : (params.companyId || sellerInfo?.companyId || ""),
      brandId: isAdminContext ? "" : (params.brandId || getSellerBrandId()),
    },
  });

  const { control, handleSubmit, watch, setValue } = methods;

  const watchedCategory = watch("category");
  const watchedCompanyId = watch("companyId");

  // Update form values when sellerInfo changes (for seller context)
  useEffect(() => {
    if (!isAdminContext && sellerInfo) {
      const brandId = getSellerBrandId();
      setValue("companyId", params.companyId || sellerInfo.companyId || "");
      setValue("brandId", params.brandId || brandId);
    }
  }, [sellerInfo, isAdminContext, params.companyId, params.brandId, setValue]);

  // Create fetchers for PaginationComboBox
  const companiesFetcher = createSimpleFetcher(apiGetCompanyList, {
    dataPath: "data.items",
    totalPath: "data.total",
  });

  // Create dynamic brand fetcher that includes companyId when provided
  const createBrandFetcher = (companyId?: string) => {
    return createSimpleFetcher(
      (params: Record<string, unknown>) => {
        const filterParams = {
          ...params,
          ...(companyId && { companyId }),
        };
        return apiGetBrands(filterParams);
      },
      {
        dataPath: "data.brands",
        totalPath: "data.totalRecords",
      }
    );
  };

  const brandsFetcher = createBrandFetcher(watchedCompanyId);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-catalog"],
    queryFn: () => apiGetCategories({ limit: 100 }),
  });

  // Transform categories data for ComboBox
  const categoryOptions = (categoriesData as CategoryResponse)?.data?.productCategories?.map((category) => ({
    value: category._id,
    label: category.name,
  })) || [];

  // Reset brand selection when company changes
  useEffect(() => {
    if (isAdminContext && watchedCompanyId) {
      setValue("brandId", "");
    }
  }, [watchedCompanyId, setValue, isAdminContext]);

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: apiBulkImportProducts,
    onSuccess: (response) => {
      setUploadSuccess(true);
      toast.success("Catalog uploaded successfully!", {
        description: `File uploaded with ${response.data.totalRows} rows. Import job ID: ${response.data.importJobId}`,
      });
    },
    onError: (error: unknown) => {
      console.error("Bulk import failed:", error);
      
      let errorMessage = "Failed to upload catalog. Please try again.";
      
      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as { response?: { data?: { message?: string; errors?: Array<{ msg?: string }> } } };
        
        // Check for specific error messages in the errors array
        if (errorResponse.response?.data?.errors?.[0]?.msg?.includes("Another import is in progress")) {
          errorMessage = "Another catalog import is currently in progress. Please wait for it to complete before uploading a new one.";
        } else if (errorResponse.response?.data?.errors?.[0]?.msg?.includes("File is required")) {
          errorMessage = "Please select a file to upload.";
        } else if (errorResponse.response?.data?.errors?.[0]?.msg?.includes("Category must be a valid MongoDB ObjectId")) {
          errorMessage = "Please select a valid category.";
        } else if (errorResponse.response?.data?.message) {
          errorMessage = errorResponse.response.data.message;
        }
      }
      
      toast.error("Upload failed", {
        description: errorMessage,
      });
    },
  });

  const handleDownloadTemplate = () => {
    if (!watchedCategory) {
      window.alert("Please select a category first");
      return;
    }

    // Create a sample template file
    const templateData = "Product Name,Description,Price,SKU,Stock Quantity,Status\nSample Product 1,Description 1,29.99,SKU001,100,active\nSample Product 2,Description 2,39.99,SKU002,50,active";
    const blob = new Blob([templateData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "catalog-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const onSubmit = async (data: CatalogFormData) => {
    setUploadSuccess(false);


    // Validate required fields - use the correct field name
    const fileList = data.templateFile_files || data.templateFile;
    if (!fileList || fileList.length === 0) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!data.category) {
      toast.error("Please select a category");
      return;
    }

    if (isAdminContext) {
      if (!data.companyId) {
        toast.error("Please select a company");
        return;
      }
      if (!data.brandId) {
        toast.error("Please select a brand");
        return;
      }
    }

    // Get the file from the FileList
    const file = fileList[0];
    if (!file) {
      toast.error("Please select a valid file");
      return;
    }

    // Prepare bulk import request
    const bulkImportData: BulkImportRequest = {
      file: file,
      brandId: data.brandId || (params.brandId || ""),
      category: data.category, // This is now the ObjectId from the API
      sellerId: isAdminContext ? (data.companyId || "") : (params.companyId || sellerInfo?.companyId || ""),
    };

    // Submit the bulk import request
    bulkImportMutation.mutate(bulkImportData);
  };

  return (
    <PageContent
      header={{
        title: "Add Catalog",
        description: "Upload product catalog using template",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Catalog Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Category Selection */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Select Category *</div>
                  <ComboBox
                    options={categoryOptions}
                    placeholder="Choose category"
                    value={watchedCategory || ""}
                    onChange={(value: string) => setValue("category", value || "")}
                    className="w-full"
                  />
                </div>

                {/* Company Selection (Admin Panel Only) */}
                {isAdminContext && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Select Company *</div>
                    <PaginationComboBox
                      apiFunction={companiesFetcher}
                      transform={(company: { _id: string; companyName: string }) => ({
                        label: company.companyName,
                        value: company._id,
                      })}
                      placeholder="Choose company"
                      value={watchedCompanyId || ""}
                      onChange={(selectedValue: string | string[]) => {
                        const stringValue = Array.isArray(selectedValue) ? selectedValue[0] : selectedValue;
                        setValue("companyId", stringValue || "");
                      }}
                      className="w-full"
                      queryKey={["companies-catalog-dropdown"]}
                      emptyMessage="No companies found"
                      enabled={isAdminContext}
                    />
                  </div>
                )}

                {/* Brand Selection (Admin Panel Only) */}
                {isAdminContext && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Select Brand *</div>
                    <PaginationComboBox
                      apiFunction={brandsFetcher}
                      transform={(brand: { _id: string; name: string }) => ({
                        label: brand.name,
                        value: brand._id,
                      })}
                      placeholder={!watchedCompanyId ? "Select company first" : "Choose brand"}
                      value={watch("brandId") || ""}
                      onChange={(selectedValue: string | string[]) => {
                        const stringValue = Array.isArray(selectedValue) ? selectedValue[0] : selectedValue;
                        setValue("brandId", stringValue || "");
                      }}
                      className="w-full"
                      queryKey={["brands-catalog-dropdown", watchedCompanyId || "none"]}
                      emptyMessage={!watchedCompanyId ? "Please select a company first" : "No brands found"}
                      enabled={isAdminContext && !!watchedCompanyId}
                    />
                  </div>
                )}

                {/* Download Template Button */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleDownloadTemplate}
                    disabled={!watchedCategory}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Download the latest template for {watchedCategory || "selected category"}
                  </p>
                </div>

                {/* File Upload */}
                <FormInput
                  control={control}
                  name="templateFile"
                  type="file"
                  label="Upload Catalog"
                  required
                  inputProps={{
                    accept: ".csv,.xlsx,.xls",
                  }}
                  placeholder="Choose catalog file"
                />

                {/* Upload Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={bulkImportMutation.isPending || !watchedCategory}
                >
                  {bulkImportMutation.isPending ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Catalog
                    </>
                  )}
                </Button>

                {/* Success Message */}
                {uploadSuccess && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Catalog uploaded successfully! Your products are being processed.
                    </AlertDescription>
                  </Alert>
                )}
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        </div>

        {/* Guidelines */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                General Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {GUIDELINES.map((guideline, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {guideline}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContent>
  );
};

export default AddCatalog;
