import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { FormInput } from "@/core/components/ui/form-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Download, Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";
import { useParams, useLocation } from "react-router";

interface CatalogFormData {
  category: string;
  companyId?: string;
  brandId?: string;
  templateFile: FileList;
}

interface AddCatalogProps {
  isAdminPanel?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: "skincare", label: "Skincare" },
  { value: "haircare", label: "Haircare" },
  { value: "lipcare", label: "Lipcare" },
];

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
  const params = useParams();
  const location = useLocation();
  
  // Determine if this is admin panel based on the route
  const isAdminContext = isAdminPanel || location.pathname.includes("/panel/") || location.pathname.includes("/admin/");
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const methods = useForm<CatalogFormData>({
    defaultValues: {
      category: "",
      companyId: isAdminContext ? "" : (params.companyId || sellerInfo?.companyId || ""),
      brandId: isAdminContext ? "" : (params.brandId || ""),
    },
  });

  const { control, handleSubmit, watch } = methods;

  const watchedCategory = watch("category");

  // Get company and brand options for admin panel
  const companyOptions = [
    { value: "company1", label: "Company 1" },
    { value: "company2", label: "Company 2" },
    // Add more companies as needed
  ];

  const brandOptions = [
    { value: "brand1", label: "Brand 1" },
    { value: "brand2", label: "Brand 2" },
    // Add more brands as needed
  ];

  const handleDownloadTemplate = () => {
    if (!watchedCategory) {
      window.alert("Please select a category first");
      return;
    }

    // Create a sample template file
    const templateData = `Category: ${watchedCategory}\nProduct Name,Description,Price,SKU\nSample Product 1,Description 1,29.99,SKU001\nSample Product 2,Description 2,39.99,SKU002`;
    const blob = new Blob([templateData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${watchedCategory}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const onSubmit = async (data: CatalogFormData) => {
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      console.log("Upload data:", {
        category: data.category,
        companyId: data.companyId,
        brandId: data.brandId,
        file: data.templateFile[0],
      });

      setUploadSuccess(true);
      setIsUploading(false);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
    }
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
                <FormInput
                  control={control}
                  name="category"
                  type="select"
                  label="Select Category"
                  required
                  options={CATEGORY_OPTIONS}
                  placeholder="Choose category"
                />

                {/* Company Selection (Admin Panel Only) */}
                {isAdminContext && (
                  <FormInput
                    control={control}
                    name="companyId"
                    type="select"
                    label="Select Company"
                    required
                    options={companyOptions}
                    placeholder="Choose company"
                  />
                )}

                {/* Brand Selection (Admin Panel Only) */}
                {isAdminContext && (
                  <FormInput
                    control={control}
                    name="brandId"
                    type="select"
                    label="Select Brand"
                    required
                    options={brandOptions}
                    placeholder="Choose brand"
                  />
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
                  disabled={isUploading || !watchedCategory}
                >
                  {isUploading ? (
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
              <div className="space-y-4">
                {GUIDELINES.map((guideline, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
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
