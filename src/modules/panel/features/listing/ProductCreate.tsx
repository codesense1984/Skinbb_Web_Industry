import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { PaginationComboBox } from "@/core/components/ui/pagination-combo-box";
import { ComboBox } from "@/core/components/ui/combo-box";
import type { Option } from "@/core/types";
import { createSimpleFetcher } from "@/core/components/data-table";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { RichTextEditor } from "@/core/components/ui/rich-text-editor";
import { Trash2, Plus } from "lucide-react";

import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { api } from "@/core/services/http";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import {
  apiGetCategoriesForDropdown,
  apiGetTagsForDropdown,
  apiGetVariationTypes,
  apiGetMarketedBy,
  apiGetManufacturedBy,
  apiGetImportedBy,
  apiGetIngredients,
  apiGetBenefits,
} from "@/modules/panel/services/http/product.service";
import { apiGetBrands } from "@/modules/panel/services/http/brand.service";
import { apiGetProductAttributes } from "@/modules/panel/services/http/product-attribute.service";
import { apiGetProductAttributeValues as apiGetAttributeValues } from "@/modules/panel/services/http/product-attribute-value.service";
import { apiGetProductDetailById } from "@/modules/panel/services/http/company.service";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { MODE } from "@/core/types";

// Fetchers for dropdown data using createSimpleFetcher
const brandsFetcher = createSimpleFetcher(apiGetBrands, {
  dataPath: "data.brands",
  totalPath: "data.totalRecords",
});

const categoriesFetcher = createSimpleFetcher(apiGetCategoriesForDropdown, {
  dataPath: "data",
  totalPath: "total",
});

const tagsFetcher = createSimpleFetcher(apiGetTagsForDropdown, {
  dataPath: "data.tags",
  totalPath: "data.totalRecords",
});

const variationTypesFetcher = createSimpleFetcher(async (_params) => {
  const response = await apiGetVariationTypes();
  return response;
}, {
  dataPath: "data.productVariationTypes",
  totalPath: "data.totalRecords",
});

const marketedByFetcher = createSimpleFetcher(async (_params) => {
  const response = await apiGetMarketedBy();
  return response;
}, {
  dataPath: "data.marketedBy",
  totalPath: "data.totalRecords",
});

const manufacturedByFetcher = createSimpleFetcher(async (_params) => {
  const response = await apiGetManufacturedBy();
  return response;
}, {
  dataPath: "data.manufacturedBy",
  totalPath: "data.totalRecords",
});

const importedByFetcher = createSimpleFetcher(async (_params) => {
  const response = await apiGetImportedBy();
  return response;
}, {
  dataPath: "data.importedBys",
  totalPath: "data.totalRecords",
});

const ingredientsFetcher = createSimpleFetcher(apiGetIngredients, {
  dataPath: "data.ingredientLists",
  totalPath: "data.totalRecords",
});

const benefitsFetcher = createSimpleFetcher(apiGetBenefits, {
  dataPath: "data.benefits",
  totalPath: "data.totalRecords",
});

// Fetcher for product attribute values (takes attributeId as parameter)
const productAttributeValueFetcher = (attributeId: string) => 
  createSimpleFetcher(
    (params: Record<string, unknown>) => apiGetAttributeValues({ ...params, attributeId }),
    {
      dataPath: "data.productAttributeValues",
      totalPath: "data.totalRecords",
    }
  );


// Fetchers for specific product attributes
const keyIngredientFetcher = ingredientsFetcher;
const countryOfOriginFetcher = productAttributeValueFetcher("685544632be6a9f5abc15bd4");
const productFormFetcher = productAttributeValueFetcher("685545f42be6a9f5abc15bf4");
const genderFetcher = productAttributeValueFetcher("6855458b2be6a9f5abc15bed");
const productTypeFetcher = productAttributeValueFetcher("6855480a2be6a9f5abc15c32");
const targetAreaFetcher = productAttributeValueFetcher("685547d62be6a9f5abc15c2b");
const finishFetcher = productAttributeValueFetcher("685547af2be6a9f5abc15c26");
const fragranceFetcher = productAttributeValueFetcher("6855478e2be6a9f5abc15c1f");
const hairTypeFetcher = productAttributeValueFetcher("685547372be6a9f5abc15c13");
const skinTypeFetcher = productAttributeValueFetcher("685547232be6a9f5abc15c0c");

// Fetchers for multi-select attributes
const targetConcernsFetcher = productAttributeValueFetcher("685545232be6a9f5abc15be4");
const productFeaturesFetcher = productAttributeValueFetcher("685544f12be6a9f5abc15bdd");
const benefitsAttributeFetcher = productAttributeValueFetcher("6855428336d659329f72b94e");
const certificationsFetcher = productAttributeValueFetcher("685546332be6a9f5abc15bfb");
const skinConcernsFetcher = productAttributeValueFetcher("685547672be6a9f5abc15c1a");

// Fetcher for variant attributes
const variantAttributesFetcher = createSimpleFetcher(apiGetProductAttributes, {
  dataPath: "data.productAttributes",
  totalPath: "data.totalRecords",
});


interface ProductCreateData {
  productName: string;
  slug: string;
  description?: string;
  status: "draft" | "publish" | "pending" | "inactive";
  price: number;
  salePrice: number;
  quantity: number;
  sku?: string;
  brand: string;
  productVariationType: string;
  productCategory: string[];
  tags?: string[];
  marketedBy?: string;
  marketedByAddress?: string;
  manufacturedBy?: string;
  manufacturedByAddress?: string;
  importedBy?: string;
  importedByAddress?: string;
  // Product Attributes
  targetConcerns?: string[]; // 685545232be6a9f5abc15be4
  productFeatures?: string[]; // 685544f12be6a9f5abc15bdd
  countryOfOrigin?: string; // 685544632be6a9f5abc15bd4
  benefits?: string[]; // 6855428336d659329f72b94e
  certifications?: string[]; // 685546332be6a9f5abc15bfb
  productForm?: string; // 685545f42be6a9f5abc15bf4
  gender?: string; // 6855458b2be6a9f5abc15bed
  productType?: string; // 6855480a2be6a9f5abc15c32
  targetArea?: string; // 685547d62be6a9f5abc15c2b
  // Additional Attributes
  finish?: string; // 685547af2be6a9f5abc15c26
  fragrance?: string; // 6855478e2be6a9f5abc15c1f
  skinConcerns?: string[]; // 685547672be6a9f5abc15c1a
  hairType?: string; // 685547372be6a9f5abc15c13
  skinType?: string; // 685547232be6a9f5abc15c0c
  // Product Details
  shelfLife?: string;
  licenseNo?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  length?: number;
  width?: number;
  height?: number;
  safetyPrecaution?: string;
  howToUse?: string;
  customerCareEmail?: string;
  customerCareNumber?: string;
  // Key Information
  ingredient?: string;
  keyIngredients?: string;
  benefitsSingle?: string;
  // Capture Details
  captureBy?: string;
  capturedDate: string;
  // Media
  thumbnail?: string;
  barcodeImage?: string;
  images?: string[];
  // Additional fields from new API
  aboutTheBrand?: string;
  weight?: string;
  dimensions?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isTrendingNow?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  hairTypes?: string[];
  hairConcerns?: string[];
  hairGoals?: string[];
  status_feedback?: string;
  // Variant attributes
  attributes?: Array<{
    attributeId: { value: string; label: string } | null;
    attributeValueId: Array<{ value: string; label: string }>;
  }>;
}

interface DropdownOption {
  _id: string;
  name?: string;
  label?: string;
  slug?: string;
  address?: string;
}


interface ProductCreateProps {
  companyId?: string;
  locationId?: string;
  brandId?: string;
  productId?: string;
  mode?: MODE;
}

const ProductCreate = (props?: ProductCreateProps) => {
  const navigate = useNavigate();
  // const urlParams = useParams<{
  //   brandId: string;
  //   companyId?: string;
  //   locationId?: string;
  // }>();

  // Use props if provided, otherwise use URL params
  const brandId = props?.brandId || "";
  const companyId = props?.companyId || "";
  let productId = props?.productId || "";
  const mode = props?.mode || "";
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { userId, role } = useAuth();

  // Get mode and id from URL parameters (fallback if not provided as props)
  if (!productId) {
    productId = searchParams.get("id") ?? "";
  }

  // Use props if available, otherwise use URL params
  const isEditMode = mode === MODE.EDIT;
  const isViewMode = mode === MODE.VIEW;
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [barcodeImage, setBarcodeImage] = useState<File | null>(null);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [isBarcodeUploading, setIsBarcodeUploading] = useState(false);
  const [isImagesUploading, setIsImagesUploading] = useState(false);
  // Existing media URLs for display
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string>("");
  const [existingBarcodeUrl, setExistingBarcodeUrl] = useState<string>("");
  const [existingImagesUrls, setExistingImagesUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);


  // Variant attributes state
  const [variantAttributes, setVariantAttributes] = useState<DropdownOption[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, DropdownOption[]>>({});

  // State for static dropdowns only
  const [statusOptions, setStatusOptions] = useState<Option[]>([]);

  // Form data state
  const [formData, setFormData] = useState<ProductCreateData>({
    productName: "",
    slug: "",
    description: "",
    status: "draft",
    price: 0,
    salePrice: 0,
    quantity: 0,
    sku: "",
    brand: brandId || "",
    productVariationType: "",
    productCategory: [],
    tags: [],
    marketedBy: "",
    marketedByAddress: "",
    manufacturedBy: "",
    manufacturedByAddress: "",
    importedBy: "",
    importedByAddress: "",
    // Product Attributes
    targetConcerns: [],
    productFeatures: [],
    countryOfOrigin: "",
    benefits: [],
    certifications: [],
    productForm: "",
    gender: "",
    productType: "",
    targetArea: "",
    // Additional Attributes
    finish: "",
    fragrance: "",
    skinConcerns: [],
    hairType: "",
    skinType: "",
    // Product Details
    shelfLife: "",
    licenseNo: "",
    manufacturingDate: "",
    expiryDate: "",
    length: 0,
    width: 0,
    height: 0,
    safetyPrecaution: "",
    howToUse: "",
    customerCareEmail: "",
    customerCareNumber: "",
    // Key Information
    ingredient: "",
    keyIngredients: "",
    benefitsSingle: "",
    // Capture Details
    captureBy: role,
    capturedDate: new Date().toISOString(),
    // Media
    thumbnail: "",
    barcodeImage: "",
    images: [],
    // Additional fields from new API
    aboutTheBrand: "",
    weight: "",
    dimensions: "",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isTrendingNow: false,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
    hairTypes: [],
    hairConcerns: [],
    hairGoals: [],
    status_feedback: "",
  });

  // Load static dropdown data on component mount
  useEffect(() => {
    // Set status options (static data)
    setStatusOptions([
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Draft", value: "draft" },
    ]);
  }, []);

  // Fetch variant attributes
  const fetchVariantAttributes = async () => {
    try {
      const response = await apiGetProductAttributes({
        isVariantField: true,
        page: 1,
        limit: 100,
      });
      const attributes = response?.data?.productAttributes || [];
      setVariantAttributes(attributes.map((attr: { _id: string; name: string }) => ({
        _id: attr._id,
        name: attr.name
      })));
    } catch (err) {
      console.error("Failed to load variant attributes", err);
    }
  };

  // Fetch attribute values for a specific attribute
  const fetchAttributeValues = async (attributeId: string) => {
    try {
      const response = await apiGetAttributeValues({
        attributeId,
        page: 1,
        limit: 100,
      });
      const values = response?.data?.productAttributeValues || [];
      const options = values.map((v: { _id: string; label: string }) => ({
        _id: v._id,
        name: v.label
      }));
      setAttributeValues(prev => ({
        ...prev,
        [attributeId]: options,
      }));
    } catch (err) {
      console.error(`Failed to load values for attribute ${attributeId}`, err);
    }
  };

  // Load variant attributes on component mount
  useEffect(() => {
    fetchVariantAttributes();
  }, []);

  // Fetch product data for edit/view mode
  useEffect(() => {
    const fetchProductData = async () => {
      if (productId && (isEditMode || isViewMode)) {
        try {
          // Only use new API endpoint - require both companyId and brandId
          if (!companyId || !brandId) {
            setError(
              "Company ID and Brand ID are required to fetch product data",
            );
            return;
          }

          const response = (await apiGetProductDetailById(productId)) as {
            statusCode: number;
            success: boolean;
            data: Record<string, unknown>;
          };

          if (response.success && response.data) {
            // Extract product data from response - handle both old and new API response structures
            const product = response.data as Record<string, unknown>;

            // Helper function to ensure we get string values
            const getStringValue = (value: unknown): string => {
              if (typeof value === "string") return value;
              if (typeof value === "object" && value && "_id" in value) {
                return String((value as { _id: string })._id);
              }
              return "";
            };

            const getStringArray = (value: unknown): string[] => {
              if (Array.isArray(value)) {
                return value.map((item) => getStringValue(item));
              }
              return [];
            };

            // Helper function to extract a single value from metaData
            const getMetaValue = (
              metaData: Array<{ key: string; value: unknown }> | undefined,
              key: string,
            ): unknown => {
              const item = metaData?.find((item) => item.key === key);
              return item?.value;
            };

            // Helper function to extract an array of values from metaData
            const getMetaValueArray = (
              metaData: Array<{ key: string; value: unknown }> | undefined,
              key: string,
            ): unknown[] => {
              const item = metaData?.find((item) => item.key === key);
              if (Array.isArray(item?.value)) {
                return item.value;
              }
              if (item?.value) {
                return [item.value]; // Wrap single object/string in array
              }
              return [];
            };

            // Populate form data with existing product data
            const initialFormData = {
              productName: (product.productName as string) || "",
              slug: (product.slug as string) || "",
              description: (product.description as string) || "",
              status:
                (product.status as
                  | "draft"
                  | "publish"
                  | "pending"
                  | "inactive") || "pending",
              price: (product.price as number) || 0,
              salePrice: (product.salePrice as number) || 0,
              quantity: (product.quantity as number) || 0,
              sku: (product.sku as string) || "",
              brand: getStringValue(product.brand),
              productVariationType: getStringValue(
                product.productVariationType,
              ),
              productCategory: getStringArray(product.productCategory),
              tags: getStringArray(product.tags),
              marketedBy: getStringValue(product.marketedBy),
              marketedByAddress: (product.marketedByAddress as string) || "",
              manufacturedBy: getStringValue(product.manufacturedBy),
              manufacturedByAddress:
                (product.manufacturedByAddress as string) || "",
              importedBy: getStringValue(product.importedBy),
              importedByAddress: (product.importedByAddress as string) || "",
              // Map from metaData array
              targetConcerns: getStringArray(
                getMetaValueArray(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "concern",
                ),
              ),
              productFeatures: getStringArray(
                getMetaValueArray(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "special-feature",
                ),
              ),
              countryOfOrigin: getStringValue(
                getMetaValue(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "country-of-origin",
                ),
              ),
              benefits: [
                ...getStringArray(product.benefit),
                ...getStringArray(
                  getMetaValueArray(
                    product.metaData as Array<{ key: string; value: unknown }>,
                    "conscious",
                  ),
                ),
                ...getStringArray(
                  getMetaValueArray(
                    product.metaData as Array<{ key: string; value: unknown }>,
                    "claims",
                  ),
                ),
              ],
              certifications: getStringArray(
                getMetaValueArray(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "certification-applicable",
                ),
              ),
              productForm: getStringValue(
                getMetaValueArray(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "formulation",
                )[0],
              ),
              gender: getStringValue(
                getMetaValue(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "gender",
                ),
              ),
              productType: getStringValue(
                getMetaValue(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "product-classification",
                ),
              ),
              targetArea: getStringValue(
                getMetaValueArray(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "body-part",
                )[0],
              ),
              finish: getStringValue(
                getMetaValueArray(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "makeup-finish",
                )[0],
              ),
              fragrance: getStringValue(
                getMetaValueArray(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "fragrance-family",
                )[0],
              ),
              skinConcerns: getStringArray(
                getMetaValueArray(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "claims",
                ),
              ),
              hairType: getStringValue(
                getMetaValue(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "hair-type",
                ),
              ),
              skinType: getStringValue(
                getMetaValue(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "skin-type",
                ),
              ),
              shelfLife: getStringValue(
                getMetaValue(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "shelf-life",
                ),
              ),
              licenseNo: getStringValue(
                getMetaValue(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "license-no",
                ),
              ),
              manufacturingDate: (product.manufacturingDate as string)
                ? (product.manufacturingDate as string).split("T")[0]
                : "",
              expiryDate: (product.expiryDate as string)
                ? (product.expiryDate as string).split("T")[0]
                : "",
              length:
                (
                  product.dimensions as {
                    length: number;
                    width: number;
                    height: number;
                  }
                )?.length || 0,
              width:
                (
                  product.dimensions as {
                    length: number;
                    width: number;
                    height: number;
                  }
                )?.width || 0,
              height:
                (
                  product.dimensions as {
                    length: number;
                    width: number;
                    height: number;
                  }
                )?.height || 0,
              safetyPrecaution: getStringValue(
                getMetaValue(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "safety-precaution",
                ),
              ),
              howToUse: getStringValue(
                getMetaValue(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "how-to-use",
                ),
              ),
              customerCareEmail: getStringValue(
                getMetaValue(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "customer-care-email",
                ),
              ),
              customerCareNumber: getStringValue(
                getMetaValue(
                  product.metaData as Array<{ key: string; value: unknown }>,
                  "customer-care-number",
                ),
              ),
              ingredient: getStringValue(
                (product.ingredients as string[])?.[0],
              ),
              keyIngredients: getStringValue(
                (product.keyIngredients as string[])?.[0],
              ),
              benefitsSingle: getStringValue(
                (product.benefit as string[])?.[0],
              ),
              captureBy: getStringValue(product.capturedBy) || userId,
              capturedDate:
                (product.capturedDate as string) || new Date().toISOString(),
              // Media - these are now string IDs
              thumbnail: getStringValue(product.thumbnail),
              barcodeImage: getStringValue(product.barcodeImage),
              images: getStringArray(
                (product.images as Array<{ url: string }>).map(
                  (image) => image.url,
                ),
              ),
              // Additional fields from new API
              aboutTheBrand: (product.aboutTheBrand as string) || "",
              weight: String((product.weight as number) || 0),
              dimensions: (product.dimensions as {
                length: number;
                width: number;
                height: number;
              })
                ? `${(product.dimensions as { length: number; width: number; height: number }).length}x${(product.dimensions as { length: number; width: number; height: number }).width}x${(product.dimensions as { length: number; width: number; height: number }).height}`
                : "",
              isFeatured: (product.isFeatured as boolean) || false,
              isNewArrival: (product.isNewArrival as boolean) || false,
              isBestSeller: (product.isBestSeller as boolean) || false,
              isTrendingNow: (product.isTrendingNow as boolean) || false,
              metaTitle: (product.metaTitle as string) || "",
              metaDescription: (product.metaDescription as string) || "",
              metaKeywords: (product.metaKeywords as string[]) || [],
              hairTypes: getStringArray(product.hairTypes),
              hairConcerns: getStringArray(product.hairConcerns),
              hairGoals: getStringArray(product.hairGoals),
              status_feedback: (product.status_feedback as string) || "",
            };

            // Additional safety check - ensure all form data values are strings
            const sanitizedFormData = {
              ...initialFormData,
              brand: String(initialFormData.brand || ""),
              productVariationType: String(
                initialFormData.productVariationType || "",
              ),
              productCategory: Array.isArray(initialFormData.productCategory)
                ? initialFormData.productCategory.map(String)
                : [],
              tags: Array.isArray(initialFormData.tags)
                ? initialFormData.tags.map(String)
                : [],
              marketedBy: String(initialFormData.marketedBy || ""),
              manufacturedBy: String(initialFormData.manufacturedBy || ""),
              importedBy: String(initialFormData.importedBy || ""),
              productType: String(initialFormData.productType || ""),
              ingredient: String(initialFormData.ingredient || ""),
              keyIngredients: String(initialFormData.keyIngredients || ""),
              benefitsSingle: String(initialFormData.benefitsSingle || ""),
              thumbnail: String(initialFormData.thumbnail || ""),
              barcodeImage: String(initialFormData.barcodeImage || ""),
              images: Array.isArray(initialFormData.images)
                ? initialFormData.images.map(String)
                : [],
            };

            setFormData(sanitizedFormData);

            // Set existing media URLs for display - these are now string IDs
            // For now, we'll treat them as URLs or construct URLs from IDs
            setExistingThumbnailUrl(
              (product.thumbnail as { url: string })?.url || "",
            );
            setExistingBarcodeUrl(
              (product.barcodeImage as { url: string })?.url || "",
            );
            setExistingImagesUrls(
              (product.images as Array<{ url: string }>)?.map(
                (image) => image.url,
              ) || [],
            );
          }
        } catch {
          setError("Failed to load product data");
        }
      }
    };

    fetchProductData();
  }, [
    productId,
    isEditMode,
    isViewMode,
    userId,
    brandId,
    companyId,
  ]);

  const handleInputChange = (
    field: keyof ProductCreateData,
    value: string | number | string[] | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare JSON data for API (files are uploaded separately)
      const jsonData = {
        productName: formData.productName,
        slug: formData.slug,
        description: formData.description,
        status: formData.status,
        sku: formData.sku,
        productVariationType: formData.productVariationType,
        brand: formData.brand || brandId,
        aboutTheBrand: "", // Add if needed
        productCategory:
          formData.productCategory.length > 0
            ? formData.productCategory
            : ["68652da5d559321c67d22f44"],
        tags: formData.tags || [],
        ingredients: formData.ingredient ? [formData.ingredient] : [],
        keyIngredients: formData.keyIngredients
          ? [formData.keyIngredients]
          : [],
        benefit: formData.benefitsSingle ? [formData.benefitsSingle] : [],
        marketedBy: formData.marketedBy,
        marketedByAddress: formData.marketedByAddress,
        manufacturedBy: formData.manufacturedBy,
        manufacturedByAddress: formData.manufacturedByAddress,
        importedBy: formData.importedBy,
        importedByAddress: formData.importedByAddress,
        // capturedBy: formData.captureBy,
        capturedBy: userId,
        capturedDate:
          formData.capturedDate.split("T")[0] ?? new Date().toISOString(), // Convert to date string
        thumbnail: formData.thumbnail || "", // Include thumbnail ID
        barcodeImage: formData.barcodeImage || "", // Include barcode ID
        images: formData.images || [], // Include image IDs
        dimensions: {
          length: formData.length || 0,
          width: formData.width || 0,
          height: formData.height || 0,
        },
        price: formData.price,
        salePrice: formData.salePrice,
        quantity: formData.quantity,
        manufacturingDate: formData.manufacturingDate,
        expiryDate: formData.expiryDate,
        metaData: [
          // Safety precaution
          ...(formData.safetyPrecaution
            ? [
                {
                  key: "safety-precaution",
                  value: formData.safetyPrecaution,
                  type: "rich-text-box",
                  ref: false,
                },
              ]
            : []),
          // How to use
          ...(formData.howToUse
            ? [
                {
                  key: "how-to-use",
                  value: formData.howToUse,
                  type: "rich-text-box",
                  ref: false,
                },
              ]
            : []),
          // Shelf life
          ...(formData.shelfLife
            ? [
                {
                  key: "shelf-life",
                  value: formData.shelfLife,
                  type: "string",
                  ref: false,
                },
              ]
            : []),
          // License no
          ...(formData.licenseNo
            ? [
                {
                  key: "license-no",
                  value: formData.licenseNo,
                  type: "string",
                  ref: false,
                },
              ]
            : []),
          // Product classification (using productType)
          ...(formData.productType
            ? [
                {
                  key: "product-classification",
                  value: formData.productType,
                  type: "objectId",
                  ref: true,
                },
              ]
            : []),
          // Body part (using targetArea)
          ...(formData.targetArea
            ? [
                {
                  key: "body-part",
                  value: [formData.targetArea],
                  type: "array",
                  ref: true,
                },
              ]
            : []),
          // Makeup finish (using finish)
          ...(formData.finish
            ? [
                {
                  key: "makeup-finish",
                  value: [formData.finish],
                  type: "array",
                  ref: true,
                },
              ]
            : []),
          // Fragrance family (using fragrance)
          ...(formData.fragrance
            ? [
                {
                  key: "fragrance-family",
                  value: [formData.fragrance],
                  type: "array",
                  ref: true,
                },
              ]
            : []),
          // Special feature (using productFeatures)
          ...(formData.productFeatures && formData.productFeatures.length > 0
            ? [
                {
                  key: "special-feature",
                  value: formData.productFeatures,
                  type: "array",
                  ref: true,
                },
              ]
            : []),
          // Hair type
          ...(formData.hairType
            ? [
                {
                  key: "hair-type",
                  value: formData.hairType,
                  type: "objectId",
                  ref: true,
                },
              ]
            : []),
          // Skin type
          ...(formData.skinType
            ? [
                {
                  key: "skin-type",
                  value: formData.skinType,
                  type: "objectId",
                  ref: true,
                },
              ]
            : []),
          // Certification applicable (using certifications)
          ...(formData.certifications && formData.certifications.length > 0
            ? [
                {
                  key: "certification-applicable",
                  value: formData.certifications[0], // Take first certification
                  type: "objectId",
                  ref: true,
                },
              ]
            : []),
          // Formulation (using productForm)
          ...(formData.productForm
            ? [
                {
                  key: "formulation",
                  value: [formData.productForm],
                  type: "array",
                  ref: true,
                },
              ]
            : []),
          // Gender
          ...(formData.gender
            ? [
                {
                  key: "gender",
                  value: formData.gender,
                  type: "objectId",
                  ref: true,
                },
              ]
            : []),
          // Concern (using targetConcerns)
          ...(formData.targetConcerns && formData.targetConcerns.length > 0
            ? [
                {
                  key: "concern",
                  value: formData.targetConcerns,
                  type: "array",
                  ref: true,
                },
              ]
            : []),
          // Conscious (using benefits)
          ...(formData.benefits && formData.benefits.length > 0
            ? [
                {
                  key: "conscious",
                  value: formData.benefits,
                  type: "array",
                  ref: true,
                },
              ]
            : []),
          // Claims (using skinConcerns)
          ...(formData.skinConcerns && formData.skinConcerns.length > 0
            ? [
                {
                  key: "claims",
                  value: formData.skinConcerns,
                  type: "array",
                  ref: true,
                },
              ]
            : []),
        ],
      };

      let result: {
        success: boolean;
        message?: string;
        data?: { _id: string };
      };

      if (isEditMode && productId) {
        // Update existing product
        result = (await api.put(
          `${ENDPOINTS.PRODUCT.MAIN}/${productId}`,
          jsonData,
        )) as { success: boolean; message?: string; data?: { _id: string } };

        // if (result.success) {
        //   // Upload files after successful update
        //   try {
        //     await uploadFiles(productId);
        //   } catch (fileError) {
        //     console.warn("File upload failed:", fileError);
        //     // Continue even if file upload fails
        // //   }
        // }
      } else {
        // Create new product
        result = (await api.post(ENDPOINTS.PRODUCT.MAIN, jsonData)) as {
          success: boolean;
          message?: string;
          data?: { _id: string };
        };

        // if (result.success && result.data?._id) {
        //   // Upload files after successful creation
        //   try {
        //     await uploadFiles(result.data._id);
        //   } catch (fileError) {
        //     console.warn("File upload failed:", fileError);
        //     // Continue even if file upload fails
        //   }
        // }
      }

      if (result.success) {
        // Navigate back to product list
        navigate(PANEL_ROUTES.LISTING.LIST);
      }
    } catch (error: unknown) {
      // Handle error silently

      const errorMessage = isEditMode
        ? "Failed to update product. Please check your input and try again."
        : "Failed to create product. Please check your input and try again.";

      // Get more detailed error message
      const detailedError =
        (
          error as {
            response?: { data?: { message?: string; error?: string } };
          }
        )?.response?.data?.message ||
        (
          error as {
            response?: { data?: { message?: string; error?: string } };
          }
        )?.response?.data?.error ||
        (error as { message?: string })?.message ||
        errorMessage;

      setError(detailedError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(PANEL_ROUTES.LISTING.LIST);
  };

  // Image upload functions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length + uploadedImages.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    // Check file size (10MB limit)
    const oversizedFiles = imageFiles.filter(
      (file) => file.size > 10 * 1024 * 1024,
    );
    if (oversizedFiles.length > 0) {
      setError("Some files exceed 10MB limit");
      return;
    }

    setIsImagesUploading(true);
    setError("");

    try {
      const imageIds = await uploadImages(imageFiles);
      setUploadedImages((prev) => [...prev, ...imageFiles]);
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...imageIds],
      }));
    } catch (error) {
      console.error("Images upload failed:", error);
      setError("Failed to upload images. Please try again.");
    } finally {
      setIsImagesUploading(false);
    }
  };

  const handleThumbnailDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleThumbnailDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleThumbnailDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      setError("Please drop an image file");
      return;
    }

    if (imageFiles.length > 1) {
      setError("Only one thumbnail image allowed");
      return;
    }

    const file = imageFiles[0];
    if (file.size > 10 * 1024 * 1024) {
      setError("Thumbnail image size must be less than 10MB");
      return;
    }

    setIsThumbnailUploading(true);
    setError("");

    try {
      const thumbnailId = await uploadThumbnail(file);
      setThumbnailImage(file);
      setFormData((prev) => ({
        ...prev,
        thumbnail: thumbnailId,
      }));
    } catch (error) {
      console.error("Thumbnail upload failed:", error);
      setError("Failed to upload thumbnail. Please try again.");
    } finally {
      setIsThumbnailUploading(false);
    }
  };

  const handleBarcodeDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleBarcodeDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleBarcodeDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      setError("Please drop an image file");
      return;
    }

    if (imageFiles.length > 1) {
      setError("Only one barcode image allowed");
      return;
    }

    const file = imageFiles[0];
    if (file.size > 10 * 1024 * 1024) {
      setError("Barcode image size must be less than 10MB");
      return;
    }

    setIsBarcodeUploading(true);
    setError("");

    try {
      const barcodeId = await uploadBarcode(file);
      setBarcodeImage(file);
      setFormData((prev) => ({
        ...prev,
        barcodeImage: barcodeId,
      }));
    } catch (error) {
      console.error("Barcode upload failed:", error);
      setError("Failed to upload barcode. Please try again.");
    } finally {
      setIsBarcodeUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length + uploadedImages.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    // Check file size (10MB limit)
    const oversizedFiles = imageFiles.filter(
      (file) => file.size > 10 * 1024 * 1024,
    );
    if (oversizedFiles.length > 0) {
      setError("Some files exceed 10MB limit");
      return;
    }

    setIsImagesUploading(true);
    setError("");

    try {
      const imageIds = await uploadImages(imageFiles);
      setUploadedImages((prev) => [...prev, ...imageFiles]);
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...imageIds],
      }));
    } catch (error) {
      console.error("Images upload failed:", error);
      setError("Failed to upload images. Please try again.");
    } finally {
      setIsImagesUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      // Also remove the corresponding image ID from formData
      setFormData((prevFormData) => ({
        ...prevFormData,
        images: prevFormData.images?.filter((_, i) => i !== index) || [],
      }));
      return newImages;
    });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openThumbnailDialog = () => {
    thumbnailInputRef.current?.click();
  };

  const openBarcodeDialog = () => {
    barcodeInputRef.current?.click();
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("type", "product-images");
    formData.append("files", file);

    const response = (await api.post(ENDPOINTS.MEDIA.UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })) as {
      success: boolean;
      data: {
        media: Array<{ _id: string; url: string }>;
      };
      message: string;
    };

    if (response.success && response.data.media.length > 0) {
      return response.data.media[0]._id;
    }
    throw new Error("Failed to upload thumbnail");
  };

  const uploadBarcode = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("type", "product-images");
    formData.append("files", file);

    const response = (await api.post(ENDPOINTS.MEDIA.UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })) as {
      success: boolean;
      data: {
        media: Array<{ _id: string; url: string }>;
      };
      message: string;
    };

    if (response.success && response.data.media.length > 0) {
      return response.data.media[0]._id;
    }
    throw new Error("Failed to upload barcode");
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    formData.append("type", "product-images");
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = (await api.post(ENDPOINTS.MEDIA.UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })) as {
      success: boolean;
      data: {
        media: Array<{ _id: string; url: string }>;
      };
      message: string;
    };

    if (response.success && response.data.media.length > 0) {
      return response.data.media.map((media) => media._id);
    }
    throw new Error("Failed to upload images");
  };

  const handleThumbnailSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Thumbnail image size must be less than 10MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Thumbnail must be an image file");
        return;
      }

      setIsThumbnailUploading(true);
      setError("");

      try {
        const thumbnailId = await uploadThumbnail(file);
        setThumbnailImage(file);
        setFormData((prev) => ({
          ...prev,
          thumbnail: thumbnailId,
        }));
      } catch (error) {
        console.error("Thumbnail upload failed:", error);
        setError("Failed to upload thumbnail. Please try again.");
      } finally {
        setIsThumbnailUploading(false);
      }
    }
  };

  const handleBarcodeSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Barcode image size must be less than 10MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Barcode must be an image file");
        return;
      }

      setIsBarcodeUploading(true);
      setError("");

      try {
        const barcodeId = await uploadBarcode(file);
        setBarcodeImage(file);
        setFormData((prev) => ({
          ...prev,
          barcodeImage: barcodeId,
        }));
      } catch (error) {
        console.error("Barcode upload failed:", error);
        setError("Failed to upload barcode. Please try again.");
      } finally {
        setIsBarcodeUploading(false);
      }
    }
  };

  const removeThumbnail = () => {
    setThumbnailImage(null);
    setExistingThumbnailUrl("");
    setFormData((prev) => ({
      ...prev,
      thumbnail: "",
    }));
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const removeBarcode = () => {
    setBarcodeImage(null);
    setExistingBarcodeUrl("");
    setFormData((prev) => ({
      ...prev,
      barcodeImage: "",
    }));
    if (barcodeInputRef.current) {
      barcodeInputRef.current.value = "";
    }
  };

  const generateSlug = () => {
    const slug = formData.productName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setFormData((prev) => ({ ...prev, slug }));
  };

  // Function to upload files separately
  // const uploadFiles = async (productId: string) => {
  //   const fileUploadPromises = [];

  //   // Upload main images
  //   if (uploadedImages.length > 0) {
  //     const imageFormData = new FormData();
  //     uploadedImages.forEach((file) => {
  //       imageFormData.append("images", file);
  //     });

  //     fileUploadPromises.push(
  //       api.post(
  //         `${ENDPOINTS.PRODUCT.MAIN}/${productId}/images`,
  //         imageFormData,
  //         {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //           },
  //         },
  //       ),
  //     );
  //   }

  //   // Upload thumbnail
  //   if (thumbnailImage) {
  //     const thumbnailFormData = new FormData();
  //     thumbnailFormData.append("thumbnail", thumbnailImage);

  //     fileUploadPromises.push(
  //       api.post(
  //         `${ENDPOINTS.PRODUCT.MAIN}/${productId}/thumbnail`,
  //         thumbnailFormData,
  //         {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //           },
  //         },
  //       ),
  //     );
  //   }

  //   // Upload barcode image
  //   if (barcodeImage) {
  //     const barcodeFormData = new FormData();
  //     barcodeFormData.append("barcodeImage", barcodeImage);

  //     fileUploadPromises.push(
  //       api.post(
  //         `${ENDPOINTS.PRODUCT.MAIN}/${productId}/barcode`,
  //         barcodeFormData,
  //         {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //           },
  //         },
  //       ),
  //     );
  //   }

  //   // Execute all file uploads in parallel
  //   if (fileUploadPromises.length > 0) {
  //     await Promise.all(fileUploadPromises);
  //   }
  // };

  // Dynamic title and description based on mode
  const getPageTitle = () => {
    if (isViewMode) return "View Product";
    if (isEditMode) return "Edit Product";
    return "Create Product";
  };

  const getPageDescription = () => {
    if (isViewMode) return "View product details and information.";
    if (isEditMode) return "Edit product information and details.";
    return "Add a new product to your catalog.";
  };

  return (
    <PageContent
      header={{
        title: getPageTitle(),
        description: getPageDescription(),
      }}
    >
      <div className="w-full">
        <div className="bg-background rounded-xl border p-8 shadow-sm">
          <form onSubmit={handleFormSubmit}>
            <div className="space-y-8">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4">
                  <div className="text-sm text-red-800">
                    <strong>Error:</strong> {error}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="productName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Product Name *
                    </Label>
                    <Input
                      id="productName"
                      value={formData.productName}
                      onChange={(e) =>
                        handleInputChange("productName", e.target.value)
                      }
                      placeholder="Enter product name"
                      required
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="slug"
                      className="text-sm font-medium text-gray-700"
                    >
                      Product Slug *
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                          handleInputChange("slug", e.target.value)
                        }
                        placeholder="product-slug"
                        required
                        className="h-10 flex-1"
                        disabled={isViewMode}
                      />
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={generateSlug}
                        className="h-10 px-4"
                        disabled={isViewMode}
                      >
                        Create Slug
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700"
                  >
                    Description
                  </Label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) =>
                      handleInputChange("description", value)
                    }
                    placeholder="Enter product description"
                    disabled={isViewMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="sku"
                    className="text-sm font-medium text-gray-700"
                  >
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    placeholder="Enter SKU"
                    className="h-10"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Pricing - Only show for simple products */}
              {(() => {
                // Check if product type is not variable
                return formData.productVariationType && !formData.productVariationType.toLowerCase().includes("variable");
              })() && (
                <div className="space-y-4">
                  <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                    Pricing & Inventory
                  </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="price"
                      className="text-sm font-medium text-gray-700"
                    >
                      Price *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange(
                          "price",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="0.00"
                      required
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="salePrice"
                      className="text-sm font-medium text-gray-700"
                    >
                      Sale Price
                    </Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) =>
                        handleInputChange(
                          "salePrice",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="0.00"
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="quantity"
                      className="text-sm font-medium text-gray-700"
                    >
                      Quantity *
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        handleInputChange(
                          "quantity",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      placeholder="0"
                      required
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div>
                </div>
                </div>
              )}

              {/* Product Details */}
              <div className="space-y-4">
                <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                  Product Details
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="brand"
                      className="text-sm font-medium text-gray-700"
                    >
                      Brand *
                    </Label>
                    <PaginationComboBox
                      apiFunction={brandsFetcher}
                      transform={(brand: { _id: string; name: string }) => ({
                        label: brand.name,
                        value: brand._id,
                      })}
                      placeholder="Select a brand"
                      value={formData.brand || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        handleInputChange("brand", stringValue);
                      }}
                      className="w-full"
                      disabled={isViewMode}
                      queryKey={["brands-dropdown"]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="productVariationType"
                      className="text-sm font-medium text-gray-700"
                    >
                      Product Type *
                    </Label>
                    <PaginationComboBox
                      apiFunction={variationTypesFetcher}
                      transform={(type: { _id: string; name: string }) => ({
                        label: type.name,
                        value: type._id,
                      })}
                      placeholder="Select product type"
                      value={formData.productVariationType || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        handleInputChange("productVariationType", stringValue);
                      }}
                      className="w-full"
                      disabled={isViewMode}
                      queryKey={["variation-types-dropdown"]}
                    />
                  </div>
                </div>

                {/* Variant Section - Only show for variable products */}
                {(() => {
                  // Check if product type is variable
                  return formData.productVariationType && formData.productVariationType.toLowerCase().includes("variable");
                })() && (
                  <div className="space-y-4">
                    <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                      Variant
                    </h3>
                    
                    {/* Add Variant Attribute Button */}
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => {
                        const newAttributes = [...(formData.attributes || []), { attributeId: null, attributeValueId: [] }];
                        setFormData(prev => ({ ...prev, attributes: newAttributes }));
                      }}
                      className="flex items-center gap-2 mb-4"
                    >
                      <Plus className="w-4 h-4" />
                      Add Variant Attribute
                    </Button>

                    {/* Attribute List */}
                    {formData.attributes?.map((attribute: { attributeId: { value: string; label: string } | null; attributeValueId: Array<{ value: string; label: string }> }, index: number) => (
                      <div key={index} className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700">
                            {attribute.attributeId?.label || "Select an Attribute"}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newAttributes = formData.attributes?.filter((_, i: number) => i !== index) || [];
                              setFormData(prev => ({ ...prev, attributes: newAttributes }));
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Attribute Selection */}
                          <div>
                            <Label htmlFor={`attribute-${index}`} className="text-sm font-medium text-gray-700">
                              Attribute
                            </Label>
                            <PaginationComboBox
                              apiFunction={variantAttributesFetcher}
                              transform={(attr: { _id: string; name: string }) => ({
                                label: attr.name,
                                value: attr._id,
                              })}
                              placeholder="Select Attribute"
                              value={attribute.attributeId?.value || ""}
                              onChange={(value: string | string[]) => {
                                const attributeId = Array.isArray(value) ? value[0] : value;
                                const selectedAttribute = variantAttributes.find(attr => attr._id === attributeId);
                                const newAttributes = [...(formData.attributes || [])];
                                newAttributes[index] = { 
                                  ...newAttributes[index], 
                                  attributeId: { value: attributeId, label: selectedAttribute?.name || "" }, 
                                  attributeValueId: [] 
                                };
                                setFormData(prev => ({ ...prev, attributes: newAttributes }));
                                // Fetch attribute values when attribute is selected
                                if (attributeId) {
                                  fetchAttributeValues(attributeId);
                                }
                              }}
                              className="w-full"
                              disabled={isViewMode}
                              queryKey={["variant-attributes-dropdown"]}
                            />
                          </div>

                          {/* Attribute Values Selection */}
                          <div>
                            <Label htmlFor={`values-${index}`} className="text-sm font-medium text-gray-700">
                              Values
                            </Label>
                            <select
                              id={`values-${index}`}
                              value={attribute.attributeValueId?.map((v: { value: string; label: string }) => v.value) || []}
                              onChange={(e) => {
                                const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                                const selectedOptions = selectedValues.map(value => {
                                  const attributeId = attribute.attributeId?.value;
                                  if (!attributeId) return { value, label: "" };
                                  const option = attributeValues[attributeId]?.find((opt) => opt._id === value);
                                  return { value, label: option?.name || "" };
                                });
                                const newAttributes = [...(formData.attributes || [])];
                                newAttributes[index] = { ...newAttributes[index], attributeValueId: selectedOptions };
                                setFormData(prev => ({ ...prev, attributes: newAttributes }));
                              }}
                              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={!attribute.attributeId?.value || isViewMode}
                            >
                              {attribute.attributeId?.value ? (
                                attributeValues[attribute.attributeId.value]?.map((option) => (
                                  <option key={option._id} value={option._id}>
                                    {option.name || ""}
                                  </option>
                                )) || <option disabled>No options available</option>
                              ) : (
                                <option disabled>Select Attribute Value</option>
                              )}
                            </select>
                            {attribute.attributeId?.value && !attributeValues[attribute.attributeId.value]?.length && (
                              <p className="text-sm text-gray-500 mt-1">No options</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Category */}
                <div className="space-y-2">
                  <Label
                    htmlFor="productCategory"
                    className="text-sm font-medium text-gray-700"
                  >
                    Category *
                  </Label>
                  <PaginationComboBox
                    apiFunction={categoriesFetcher}
                    transform={(category: { _id: string; name: string }) => ({
                      label: category.name,
                      value: category._id,
                    })}
                    placeholder="Select a category"
                    value={formData.productCategory[0] || ""}
                    onChange={(value: string | string[]) => {
                      const stringValue = Array.isArray(value) ? value[0] : value;
                      handleInputChange("productCategory", [stringValue]);
                    }}
                    className="w-full"
                    disabled={isViewMode}
                    queryKey={["categories-dropdown"]}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="tags"
                    className="text-sm font-medium text-gray-700"
                  >
                    Tags
                  </Label>
                  <PaginationComboBox
                    apiFunction={tagsFetcher}
                    transform={(tag: { _id: string; name: string }) => ({
                      label: tag.name,
                      value: tag._id,
                    })}
                    placeholder="Select or create tags"
                    value={formData.tags?.[0] || ""}
                    onChange={(value: string | string[]) => {
                      const stringValue = Array.isArray(value) ? value[0] : value;
                      handleInputChange("tags", [stringValue]);
                    }}
                    className="w-full"
                    disabled={isViewMode}
                    queryKey={["tags-dropdown"]}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className="text-sm font-medium text-gray-700"
                  >
                    Status *
                  </Label>
                  <ComboBox
                    options={statusOptions}
                    placeholder="Select status"
                    value={formData.status}
                    onChange={(value: string) => {
                      handleInputChange("status", value);
                    }}
                    className="w-full"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                  Company Information
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="marketedBy"
                      className="text-sm font-medium text-gray-700"
                    >
                      Marketed By
                    </Label>
                    <PaginationComboBox
                      apiFunction={marketedByFetcher}
                      transform={(item: { _id: string; name: string }) => ({
                        label: item.name,
                        value: item._id,
                      })}
                      placeholder="Select Market By"
                      value={formData.marketedBy || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        handleInputChange("marketedBy", stringValue);
                      }}
                      className="w-full"
                      disabled={isViewMode}
                      queryKey={["marketed-by-dropdown"]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="manufacturedBy"
                      className="text-sm font-medium text-gray-700"
                    >
                      Manufacture By
                    </Label>
                    <PaginationComboBox
                      apiFunction={manufacturedByFetcher}
                      transform={(item: { _id: string; name: string }) => ({
                        label: item.name,
                        value: item._id,
                      })}
                      placeholder="Select Manufacture By"
                      value={formData.manufacturedBy || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        handleInputChange("manufacturedBy", stringValue);
                      }}
                      className="w-full"
                      disabled={isViewMode}
                      queryKey={["manufactured-by-dropdown"]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="importedBy"
                    className="text-sm font-medium text-gray-700"
                  >
                    Import By
                  </Label>
                  <PaginationComboBox
                    apiFunction={importedByFetcher}
                    transform={(item: { _id: string; name: string }) => ({
                      label: item.name,
                      value: item._id,
                    })}
                    placeholder="Select Import By"
                    value={formData.importedBy || ""}
                    onChange={(value: string | string[]) => {
                      const stringValue = Array.isArray(value) ? value[0] : value;
                      handleInputChange("importedBy", stringValue);
                    }}
                    className="w-full"
                    disabled={isViewMode}
                    queryKey={["imported-by-dropdown"]}
                  />
                </div>

                {/* Address Fields */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="marketedByAddress"
                      className="text-sm font-medium text-gray-700"
                    >
                      Market By Address
                    </Label>
                    <Input
                      id="marketedByAddress"
                      value={formData.marketedByAddress || ""}
                      onChange={(e) =>
                        handleInputChange("marketedByAddress", e.target.value)
                      }
                      placeholder="Enter Marketed By Address"
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="manufacturedByAddress"
                      className="text-sm font-medium text-gray-700"
                    >
                      Manufacture By Address
                    </Label>
                    <Input
                      id="manufacturedByAddress"
                      value={formData.manufacturedByAddress || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "manufacturedByAddress",
                          e.target.value,
                        )
                      }
                      placeholder="Enter Manufacture By Address"
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="importedByAddress"
                    className="text-sm font-medium text-gray-700"
                  >
                    Import By Address
                  </Label>
                  <Input
                    id="importedByAddress"
                    value={formData.importedByAddress || ""}
                    onChange={(e) =>
                      handleInputChange("importedByAddress", e.target.value)
                    }
                    placeholder="Enter Import By Address"
                    className="h-10"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                  Product Details
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="shelfLife"
                      className="text-sm font-medium text-gray-700"
                    >
                      Shelf Life
                    </Label>
                    <Input
                      id="shelfLife"
                      value={formData.shelfLife || ""}
                      onChange={(e) =>
                        handleInputChange("shelfLife", e.target.value)
                      }
                      placeholder="Enter Shelf Life"
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="licenseNo"
                      className="text-sm font-medium text-gray-700"
                    >
                      License No
                    </Label>
                    <Input
                      id="licenseNo"
                      value={formData.licenseNo || ""}
                      onChange={(e) =>
                        handleInputChange("licenseNo", e.target.value)
                      }
                      placeholder="Enter License No"
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="manufacturingDate"
                      className="text-sm font-medium text-gray-700"
                    >
                      Manufacturing Date
                    </Label>
                    <Input
                      id="manufacturingDate"
                      type="date"
                      value={formData.manufacturingDate || ""}
                      onChange={(e) =>
                        handleInputChange("manufacturingDate", e.target.value)
                      }
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="expiryDate"
                      className="text-sm font-medium text-gray-700"
                    >
                      Expiry Date
                    </Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate || ""}
                      onChange={(e) =>
                        handleInputChange("expiryDate", e.target.value)
                      }
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="length"
                      className="text-sm font-medium text-gray-700"
                    >
                      Length (cm)
                    </Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.1"
                      value={formData.length || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "length",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="Length"
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="width"
                      className="text-sm font-medium text-gray-700"
                    >
                      Width (cm)
                    </Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      value={formData.width || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "width",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="Width"
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="height"
                      className="text-sm font-medium text-gray-700"
                    >
                      Height (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={formData.height || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "height",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="Height"
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="safetyPrecaution"
                    className="text-sm font-medium text-gray-700"
                  >
                    Safety Precaution
                  </Label>
                  <RichTextEditor
                    value={formData.safetyPrecaution || ""}
                    onChange={(value) =>
                      handleInputChange("safetyPrecaution", value)
                    }
                    placeholder="Enter safety precaution"
                    disabled={isViewMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="howToUse"
                    className="text-sm font-medium text-gray-700"
                  >
                    How To Use
                  </Label>
                  <RichTextEditor
                    value={formData.howToUse || ""}
                    onChange={(value) => handleInputChange("howToUse", value)}
                    placeholder="Enter how to use instructions"
                    disabled={isViewMode}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* <div className="space-y-2">
                    <Label
                      htmlFor="customerCareEmail"
                      className="text-sm font-medium text-gray-700"
                    >
                      Customer Care Email
                    </Label>
                    <Input
                      id="customerCareEmail"
                      type="email"
                      value={formData.customerCareEmail || ""}
                      onChange={(e) =>
                        handleInputChange("customerCareEmail", e.target.value)
                      }
                      placeholder="Enter customer care email"
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div> */}

                  {/* <div className="space-y-2">
                    <Label
                      htmlFor="customerCareNumber"
                      className="text-sm font-medium text-gray-700"
                    >
                      Customer Care Number
                    </Label>
                    <Input
                      id="customerCareNumber"
                      value={formData.customerCareNumber || ""}
                      onChange={(e) =>
                        handleInputChange("customerCareNumber", e.target.value)
                      }
                      placeholder="Enter customer care number"
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div> */}
                </div>
              </div>

              {/* Key Information */}
              <div className="space-y-4">
                <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                  Key Information
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="ingredient"
                      className="text-sm font-medium text-gray-700"
                    >
                      Ingredient
                    </Label>
                    <PaginationComboBox
                      apiFunction={ingredientsFetcher}
                      transform={(ingredient: { _id: string; name: string }) => ({
                        label: ingredient.name,
                        value: ingredient._id,
                      })}
                      placeholder="Select an Ingredient"
                      value={formData.ingredient || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        handleInputChange("ingredient", stringValue);
                      }}
                      className="w-full"
                      disabled={isViewMode}
                      queryKey={["ingredients-dropdown"]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="keyIngredients"
                      className="text-sm font-medium text-gray-700"
                    >
                      Key Ingredients
                    </Label>
                    <PaginationComboBox
                      apiFunction={keyIngredientFetcher}
                      transform={(ingredient: { _id: string; name: string }) => ({
                        label: ingredient.name,
                        value: ingredient._id,
                      })}
                      placeholder="Select a Key Ingredient"
                      value={formData.keyIngredients || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        handleInputChange("keyIngredients", stringValue);
                      }}
                      className="w-full"
                      disabled={isViewMode}
                      queryKey={["key-ingredients-dropdown"]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="benefitsSingle"
                    className="text-sm font-medium text-gray-700"
                  >
                    Benefits
                  </Label>
                  <PaginationComboBox
                    apiFunction={benefitsFetcher}
                    transform={(benefit: { _id: string; name: string }) => ({
                      label: benefit.name,
                      value: benefit._id,
                    })}
                    placeholder="Select a benefit"
                    value={formData.benefitsSingle || ""}
                    onChange={(value: string | string[]) => {
                      const stringValue = Array.isArray(value) ? value[0] : value;
                      handleInputChange("benefitsSingle", stringValue);
                    }}
                    className="w-full"
                    disabled={isViewMode}
                    queryKey={["benefits-dropdown"]}
                  />
                </div>
              </div>

              {/* Capture Details */}
              {/* <div className="space-y-4">
                <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                  Capture Details
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="captureBy"
                      className="text-sm font-medium text-gray-700"
                    >
                      Capture By
                    </Label>
                    <Input
                      id="customerCareNumber"
                      value={formData.captureBy || "admin"}
                      onChange={(e) =>
                        handleInputChange("captureBy", e.target.value)
                      }
                      placeholder="Select capture by"
                      className="h-10"
                      disabled={true}
                    />
                    
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="capturedDate"
                      className="text-sm font-medium text-gray-700"
                    >
                      Captured Date
                    </Label>
                    <Input
                      id="capturedDate"
                      type="date"
                      value={
                        formData.capturedDate
                          ? formData.capturedDate.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "capturedDate",
                          new Date(e.target.value).toISOString(),
                        )
                      }
                      className="h-10"
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </div> */}

              {/* Product Attributes Section */}
              <div className="space-y-4">
                <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                  Product Attributes
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                    <PaginationComboBox
                      apiFunction={countryOfOriginFetcher}
                      transform={(item: { _id: string; label: string }) => ({
                        label: item.label,
                        value: item._id,
                      })}
                      placeholder="Select country of origin"
                      value={formData.countryOfOrigin || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        handleInputChange("countryOfOrigin", stringValue);
                      }}
                      className="w-full"
                      disabled={isViewMode}
                      queryKey={["country-of-origin-dropdown"]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="productForm">Product Form</Label>
                    <PaginationComboBox
                      apiFunction={productFormFetcher}
                      transform={(item: { _id: string; label: string }) => ({
                        label: item.label,
                        value: item._id,
                      })}
                      placeholder="Select product form"
                      value={formData.productForm || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        handleInputChange("productForm", stringValue);
                      }}
                      className="w-full"
                      disabled={isViewMode}
                      queryKey={["product-form-dropdown"]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <PaginationComboBox
                      apiFunction={genderFetcher}
                      transform={(item: { _id: string; label: string }) => ({
                        label: item.label,
                        value: item._id,
                      })}
                      placeholder="Select gender"
                      value={formData.gender || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        handleInputChange("gender", stringValue);
                      }}
                      className="w-full"
                      disabled={isViewMode}
                      queryKey={["gender-dropdown"]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="productType">Product Type</Label>
                    <PaginationComboBox
                      apiFunction={productTypeFetcher}
                      transform={(item: { _id: string; label: string }) => ({
                        label: item.label,
                        value: item._id,
                      })}
                      placeholder="Select product type"
                      value={formData.productType || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        handleInputChange("productType", stringValue);
                      }}
                      className="w-full"
                      disabled={isViewMode}
                      queryKey={["product-type-dropdown"]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetArea">Target Area</Label>
                    <PaginationComboBox
                      apiFunction={targetAreaFetcher}
                      transform={(item: { _id: string; label: string }) => ({
                        label: item.label,
                        value: item._id,
                      })}
                      placeholder="Select target area"
                      value={formData.targetArea || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        handleInputChange("targetArea", stringValue);
                      }}
                      className="w-full"
                      disabled={isViewMode}
                      queryKey={["target-area-dropdown"]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="finish">Finish</Label>
                    <PaginationComboBox
                      apiFunction={finishFetcher}
                      transform={(item: { _id: string; label: string }) => ({
                        label: item.label,
                        value: item._id,
                      })}
                      placeholder="Select finish"
                      value={formData.finish || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        handleInputChange("finish", stringValue);
                      }}
                      className="w-full"
                      disabled={isViewMode}
                      queryKey={["finish-dropdown"]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fragrance">Fragrance</Label>
                    <PaginationComboBox
                      apiFunction={fragranceFetcher}
                      transform={(item: { _id: string; label: string }) => ({
                        label: item.label,
                        value: item._id,
                      })}
                      placeholder="Select fragrance"
                      value={formData.fragrance || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        handleInputChange("fragrance", stringValue);
                      }}
                      className="w-full"
                      disabled={isViewMode}
                      queryKey={["fragrance-dropdown"]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="hairType">Hair Type</Label>
                    <PaginationComboBox
                      apiFunction={hairTypeFetcher}
                      transform={(item: { _id: string; label: string }) => ({
                        label: item.label,
                        value: item._id,
                      })}
                      placeholder="Select hair type"
                      value={formData.hairType || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        handleInputChange("hairType", stringValue);
                      }}
                      className="w-full"
                      disabled={isViewMode}
                      queryKey={["hair-type-dropdown"]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="skinType">Skin Type</Label>
                    <PaginationComboBox
                      apiFunction={skinTypeFetcher}
                      transform={(item: { _id: string; label: string }) => ({
                        label: item.label,
                        value: item._id,
                      })}
                      placeholder="Select skin type"
                      value={formData.skinType || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        handleInputChange("skinType", stringValue);
                      }}
                      className="w-full"
                      disabled={isViewMode}
                      queryKey={["skin-type-dropdown"]}
                    />
                  </div>
                </div>

                {/* Multi-select attributes */}
                <div className="mt-6 space-y-4">
                  <div>
                    <Label>Target Concerns</Label>
                    <PaginationComboBox
                      apiFunction={targetConcernsFetcher}
                      transform={(concern: { _id: string; label: string }) => ({
                        label: concern.label,
                        value: concern._id,
                      })}
                      placeholder="Select target concerns"
                      value={formData.targetConcerns || []}
                      onChange={(value: string | string[]) => {
                        const arrayValue = Array.isArray(value) ? value : [value];
                        handleInputChange("targetConcerns", arrayValue);
                      }}
                      className="w-full"
                            disabled={isViewMode}
                      queryKey={["target-concerns-dropdown"]}
                          />
                  </div>

                  <div>
                    <Label>Product Features</Label>
                    <PaginationComboBox
                      apiFunction={productFeaturesFetcher}
                      transform={(feature: { _id: string; label: string }) => ({
                        label: feature.label,
                        value: feature._id,
                      })}
                      placeholder="Select product features"
                      value={formData.productFeatures || []}
                      onChange={(value: string | string[]) => {
                        const arrayValue = Array.isArray(value) ? value : [value];
                        handleInputChange("productFeatures", arrayValue);
                      }}
                      className="w-full"
                            disabled={isViewMode}
                      queryKey={["product-features-dropdown"]}
                          />
                  </div>

                  <div>
                    <Label>Benefits</Label>
                    <PaginationComboBox
                      apiFunction={benefitsAttributeFetcher}
                      transform={(benefit: { _id: string; label: string }) => ({
                        label: benefit.label,
                        value: benefit._id,
                      })}
                      placeholder="Select benefits"
                      value={formData.benefits || []}
                      onChange={(value: string | string[]) => {
                        const arrayValue = Array.isArray(value) ? value : [value];
                        handleInputChange("benefits", arrayValue);
                      }}
                      className="w-full"
                            disabled={isViewMode}
                      queryKey={["benefits-attribute-dropdown"]}
                          />
                  </div>

                  <div>
                    <Label>Certifications</Label>
                    <PaginationComboBox
                      apiFunction={certificationsFetcher}
                      transform={(cert: { _id: string; label: string }) => ({
                        label: cert.label,
                        value: cert._id,
                      })}
                      placeholder="Select certifications"
                      value={formData.certifications || []}
                      onChange={(value: string | string[]) => {
                        const arrayValue = Array.isArray(value) ? value : [value];
                        handleInputChange("certifications", arrayValue);
                      }}
                      className="w-full"
                            disabled={isViewMode}
                      queryKey={["certifications-dropdown"]}
                          />
                  </div>

                  <div>
                    <Label>Skin Concerns</Label>
                    <PaginationComboBox
                      apiFunction={skinConcernsFetcher}
                      transform={(concern: { _id: string; label: string }) => ({
                        label: concern.label,
                        value: concern._id,
                      })}
                      placeholder="Select skin concerns"
                      value={formData.skinConcerns || []}
                      onChange={(value: string | string[]) => {
                        const arrayValue = Array.isArray(value) ? value : [value];
                        handleInputChange("skinConcerns", arrayValue);
                      }}
                      className="w-full"
                            disabled={isViewMode}
                      queryKey={["skin-concerns-dropdown"]}
                          />
                  </div>
                </div>
              </div>

              {/* Thumbnail Upload Section */}
              <div className="space-y-4">
                <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                  Thumbnail
                </h3>
                {!isViewMode && (
                  <p className="text-sm text-gray-600">
                    Max 1 image(s), up to 10MB each. Allowed: image/jpeg,
                    image/png
                  </p>
                )}

                <div
                  className={`rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors ${
                    isViewMode
                      ? "cursor-default"
                      : isThumbnailUploading
                        ? "cursor-not-allowed opacity-50"
                        : isDragOver
                          ? "border-blue-400 bg-blue-50"
                          : "cursor-pointer hover:border-gray-400"
                  }`}
                  onClick={
                    isViewMode || isThumbnailUploading
                      ? undefined
                      : openThumbnailDialog
                  }
                  onKeyDown={
                    isViewMode || isThumbnailUploading
                      ? undefined
                      : (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openThumbnailDialog();
                          }
                        }
                  }
                  onDragOver={
                    isViewMode || isThumbnailUploading
                      ? undefined
                      : handleThumbnailDragOver
                  }
                  onDragLeave={
                    isViewMode || isThumbnailUploading
                      ? undefined
                      : handleThumbnailDragLeave
                  }
                  onDrop={
                    isViewMode || isThumbnailUploading
                      ? undefined
                      : handleThumbnailDrop
                  }
                  tabIndex={isViewMode || isThumbnailUploading ? -1 : 0}
                  role={
                    isViewMode || isThumbnailUploading ? undefined : "button"
                  }
                >
                  {isThumbnailUploading ? (
                    <div className="space-y-4">
                      <div className="mx-auto h-16 w-16 text-blue-500">
                        <svg
                          className="animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-blue-600">Uploading thumbnail...</p>
                      </div>
                    </div>
                  ) : thumbnailImage ? (
                    <div className="space-y-4">
                      <div className="mx-auto aspect-square w-32 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={URL.createObjectURL(thumbnailImage)}
                          alt="Thumbnail preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          {thumbnailImage.name}
                        </p>
                        <Button
                          type="button"
                          variant="outlined"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isViewMode) removeThumbnail();
                          }}
                          disabled={isViewMode}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : existingThumbnailUrl ? (
                    <div className="space-y-4">
                      <div className="mx-auto aspect-square w-32 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={existingThumbnailUrl}
                          alt="Existing thumbnail"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Existing thumbnail
                        </p>
                        {!isViewMode && (
                          <Button
                            type="button"
                            variant="outlined"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeThumbnail();
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto h-16 w-16 text-gray-400">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          {isViewMode
                            ? "No thumbnail uploaded"
                            : "Drop image here or "}
                          {!isViewMode && (
                            <span className="text-blue-600">
                              Click to browse
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleThumbnailSelect}
                  className="hidden"
                />
              </div>

              {/* Barcode Image Upload Section */}
              <div className="space-y-4">
                <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                  Barcode Image
                </h3>
                {!isViewMode && (
                  <p className="text-sm text-gray-600">
                    Max 1 image(s), up to 10MB each. Allowed: image/jpeg,
                    image/png
                  </p>
                )}

                <div
                  className={`rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors ${
                    isViewMode
                      ? "cursor-default"
                      : isBarcodeUploading
                        ? "cursor-not-allowed opacity-50"
                        : isDragOver
                          ? "border-blue-400 bg-blue-50"
                          : "cursor-pointer hover:border-gray-400"
                  }`}
                  onClick={
                    isViewMode || isBarcodeUploading
                      ? undefined
                      : openBarcodeDialog
                  }
                  onKeyDown={
                    isViewMode || isBarcodeUploading
                      ? undefined
                      : (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openBarcodeDialog();
                          }
                        }
                  }
                  onDragOver={
                    isViewMode || isBarcodeUploading
                      ? undefined
                      : handleBarcodeDragOver
                  }
                  onDragLeave={
                    isViewMode || isBarcodeUploading
                      ? undefined
                      : handleBarcodeDragLeave
                  }
                  onDrop={
                    isViewMode || isBarcodeUploading
                      ? undefined
                      : handleBarcodeDrop
                  }
                  tabIndex={isViewMode || isBarcodeUploading ? -1 : 0}
                  role={isViewMode || isBarcodeUploading ? undefined : "button"}
                >
                  {isBarcodeUploading ? (
                    <div className="space-y-4">
                      <div className="mx-auto h-16 w-16 text-blue-500">
                        <svg
                          className="animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-blue-600">Uploading barcode...</p>
                      </div>
                    </div>
                  ) : barcodeImage ? (
                    <div className="space-y-4">
                      <div className="mx-auto aspect-square w-32 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={URL.createObjectURL(barcodeImage)}
                          alt="Barcode preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          {barcodeImage.name}
                        </p>
                        <Button
                          type="button"
                          variant="outlined"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isViewMode) removeBarcode();
                          }}
                          disabled={isViewMode}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : existingBarcodeUrl ? (
                    <div className="space-y-4">
                      <div className="mx-auto aspect-square w-32 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={existingBarcodeUrl}
                          alt="Existing barcode"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Existing barcode
                        </p>
                        {!isViewMode && (
                          <Button
                            type="button"
                            variant="outlined"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBarcode();
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto h-16 w-16 text-gray-400">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          {isViewMode
                            ? "No barcode uploaded"
                            : "Drop image here or "}
                          {!isViewMode && (
                            <span className="text-blue-600">
                              Click to browse
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={barcodeInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleBarcodeSelect}
                  className="hidden"
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                  Images
                </h3>

                {/* Upload Area */}
                <div
                  className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                    isImagesUploading
                      ? "cursor-not-allowed opacity-50"
                      : isDragOver
                        ? "border-blue-400 bg-blue-50"
                        : isViewMode
                          ? "cursor-default border-gray-300"
                          : "cursor-pointer border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={
                    isViewMode || isImagesUploading ? undefined : handleDragOver
                  }
                  onDragLeave={
                    isViewMode || isImagesUploading
                      ? undefined
                      : handleDragLeave
                  }
                  onDrop={
                    isViewMode || isImagesUploading ? undefined : handleDrop
                  }
                >
                  {isImagesUploading ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                        <svg
                          className="h-8 w-8 animate-spin text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-blue-600">Uploading images...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4">
                      {/* Upload Icon */}
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <svg
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>

                      {/* Upload Text */}
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          {isViewMode
                            ? "No images uploaded"
                            : "Drop image here or "}
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={openFileDialog}
                              className="text-blue-600 underline hover:text-blue-700"
                            >
                              Click to browse
                            </button>
                          )}
                        </p>
                        {!isViewMode && (
                          <p className="text-sm text-gray-500">
                            Max 10 image(s) • up to 10MB each • Allowed:
                            image/jpeg, image/png
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Uploaded Images Preview */}
                {(uploadedImages.length > 0 ||
                  existingImagesUrls.length > 0) && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Images (
                      {uploadedImages.length + existingImagesUrls.length}/10)
                    </h4>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                      {/* Existing Images */}
                      {existingImagesUrls.map((url, index) => (
                        <div
                          key={`existing-${index}`}
                          className="group relative"
                        >
                          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={url}
                              alt={`Existing ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={() => {
                                const newUrls = existingImagesUrls.filter(
                                  (_, i) => i !== index,
                                );
                                setExistingImagesUrls(newUrls);
                                setFormData((prev) => ({
                                  ...prev,
                                  images:
                                    prev.images?.filter(
                                      (_, i) => i !== index,
                                    ) || [],
                                }));
                              }}
                              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white transition-colors hover:bg-red-600"
                            >
                              ×
                            </button>
                          )}
                          <div className="mt-1 truncate text-xs text-gray-500">
                            Existing image {index + 1}
                          </div>
                        </div>
                      ))}
                      {/* New Uploaded Images */}
                      {uploadedImages.map((file, index) => (
                        <div key={`new-${index}`} className="group relative">
                          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => !isViewMode && removeImage(index)}
                            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white transition-colors hover:bg-red-600"
                            disabled={isViewMode}
                          >
                            ×
                          </button>
                          <div className="mt-1 truncate text-xs text-gray-500">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-4 border-t border-gray-200 pt-8">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancel}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                {!isViewMode && (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2"
                  >
                    {isSubmitting
                      ? isEditMode
                        ? "Updating..."
                        : "Creating..."
                      : isEditMode
                        ? "Update Product"
                        : "Create Product"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </PageContent>
  );
};

export default ProductCreate;
