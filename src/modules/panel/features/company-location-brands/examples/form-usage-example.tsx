import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormFieldsRenderer } from "@/core/components/ui/form-input";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { brandFormSchema, brandSchema, type BrandFormData } from "../schema/brand.schema";
import { MODE } from "@/core/types";
import type { CompanyLocationBrand } from "@/modules/panel/types/brand.type";

// Default values function with parameters
const getDefaultValues = (brandData?: CompanyLocationBrand | null): BrandFormData => {
  return {
    name: brandData?.name || "",
    aboutTheBrand: brandData?.aboutTheBrand || "",
    websiteUrl: brandData?.websiteUrl || "",
    totalSKU: brandData?.totalSKU ? String(brandData.totalSKU) : "0",
    averageSellingPrice: brandData?.averageSellingPrice ? String(brandData.averageSellingPrice) : "0",
    marketingBudget: brandData?.marketingBudget ? String(brandData.marketingBudget) : "0",
    instagramUrl: brandData?.instagramUrl || "",
    facebookUrl: brandData?.facebookUrl || "",
    youtubeUrl: brandData?.youtubeUrl || "",
    productCategory: brandData?.productCategory || [],
    sellingOn: brandData?.sellingOn || [],
    isActive: brandData?.isActive ?? true,
  };
};

/**
 * Example component demonstrating how to use the refactored form-input pattern
 * This follows the same pattern as the company onboarding forms
 */
const BrandFormExample = () => {
  const mode = MODE.ADD; // or MODE.EDIT, MODE.VIEW

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: getDefaultValues(), // Use default values function
  });

  const { handleSubmit, control, reset } = form;

  const onSubmit = (data: BrandFormData) => {
    console.log("Form data:", data);
  };

  const handleResetForm = () => {
    reset(getDefaultValues());
  };

  const handleResetWithData = () => {
    // Example: Reset with mock API data
    const mockBrandData: Partial<CompanyLocationBrand> = {
      _id: "123",
      name: "Example Brand",
      aboutTheBrand: "This is an example brand",
      websiteUrl: "https://example.com",
      totalSKU: 100,
      averageSellingPrice: 25.99,
      marketingBudget: 5000,
      instagramUrl: "https://instagram.com/example",
      facebookUrl: "https://facebook.com/example",
      youtubeUrl: "https://youtube.com/example",
      productCategory: ["beauty", "skincare"],
      sellingOn: [
        { platform: "amazon", url: "https://amazon.com/example" },
        { platform: "flipkart", url: "https://flipkart.com/example" }
      ],
      isActive: true,
    };
    reset(getDefaultValues(mockBrandData as CompanyLocationBrand));
  };

  return (
    <div className="w-full">
      <div className="bg-background rounded-xl border shadow-sm p-8">
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information Card */}
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <FormFieldsRenderer<BrandFormData>
                      control={control}
                      fieldConfigs={brandSchema.basic_information({ mode })}
                      className="space-y-6"
                    />
                  </CardContent>
                </Card>

                {/* Business Metrics Card */}
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Business Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <FormFieldsRenderer<BrandFormData>
                      control={control}
                      fieldConfigs={brandSchema.business_metrics({ mode })}
                      className="space-y-6"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Social Media Card */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Social Media
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <FormFieldsRenderer<BrandFormData>
                    control={control}
                    fieldConfigs={brandSchema.social_media({ mode })}
                    className="grid grid-cols-1 gap-6 md:grid-cols-3"
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-8 mt-8 border-t border-gray-200">
                <Button type="button" variant="outlined" onClick={handleResetForm}>
                  Reset to Default
                </Button>
                <Button type="button" variant="outlined" onClick={handleResetWithData}>
                  Load Mock Data
                </Button>
                <Button type="submit">
                  Submit
                </Button>
              </div>
            </form>
          </FormProvider>
      </div>
    </div>
  );
};

export default BrandFormExample;
