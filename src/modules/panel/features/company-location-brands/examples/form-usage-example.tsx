import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormFieldsRenderer } from "@/core/components/ui/form-input";
import { Button } from "@/core/components/ui/button";
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
    const mockBrandData: CompanyLocationBrand = {
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
    reset(getDefaultValues(mockBrandData));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Brand Form Example</h2>
      
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <FormFieldsRenderer<BrandFormData>
              control={control}
              fieldConfigs={brandSchema.basic_information({ mode })}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
            />
          </div>

          {/* Business Metrics Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Business Metrics</h3>
            <FormFieldsRenderer<BrandFormData>
              control={control}
              fieldConfigs={brandSchema.business_metrics({ mode })}
              className="grid grid-cols-1 gap-6 md:grid-cols-3"
            />
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social Media</h3>
            <FormFieldsRenderer<BrandFormData>
              control={control}
              fieldConfigs={brandSchema.social_media({ mode })}
              className="grid grid-cols-1 gap-6 md:grid-cols-3"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
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
  );
};

export default BrandFormExample;
