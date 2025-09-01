import type { FullCompanyFormType } from "../schema/fullCompany.schema";
import type {
  OnboardingSubmitRequest,
  CompanyDetailItem,
} from "@/modules/panel/types/company.type";

/**
 * Formats established date from YYYY-MM to MM/YYYY format
 */
function formatEstablishedDate(dateString: string): string {
  if (!dateString) return "";

  // Handle YYYY-MM format
  if (dateString.includes("-")) {
    const [year, month] = dateString.split("-");
    return `${month}/${year}`;
  }

  // Handle MM/YYYY format (already correct)
  if (dateString.includes("/")) {
    return dateString;
  }

  // Handle YYYY format (assume January)
  if (dateString.length === 4) {
    return `01/${dateString}`;
  }

  return dateString;
}

/**
 * Transforms the form data to the API request format for onboarding submission
 * Files are merged directly into the data object
 */
export function transformFormDataToApiRequest(
  formData: FullCompanyFormType,
  roleId: string = "6875fc068683bb026013181b", // Default role ID, can be made configurable
): OnboardingSubmitRequest & Record<string, any> {
  // Get the first address (assuming it's the registered address)
  const primaryAddress = formData.address?.[0] || {};

  // Get document numbers and files
  const documents = formData.documents || [];
  const coiDoc = documents.find((doc) => doc.type === "coi");
  const panDoc = documents.find((doc) => doc.type === "pan");
  const gstDoc = documents.find((doc) => doc.type === "gstLicense");
  const msmeDoc = documents.find((doc) => doc.type === "msme");
  const authDoc = documents.find((doc) => doc.type === "brandAuthorisation");

  const apiData: OnboardingSubmitRequest & Record<string, any> = {
    _id: formData?._id || null,
    ownerName: formData.name || "",
    ownerEmail: formData.email || "",
    phoneNumber: formData.phoneNumber || "",
    password: formData.password || "",
    roleId,
    companyName: formData.companyName || "",
    companyDescription:
      formData.description || "Company description not provided",
    businessType: formData.businessType || "",
    establishedIn: formData.establishedIn
      ? formatEstablishedDate(String(formData.establishedIn))
      : "",
    companyCategory: formData.category || "",
    gstNumber: gstDoc?.number || "",
    panNumber: panDoc?.number || "",
    cinNumber: coiDoc?.number || "",
    msmeNumber: msmeDoc?.number || "",
    website: formData.website || "",
    instagramUrl: formData.instagramUrl || "",
    facebookUrl: formData.facebookUrl || "",
    youtubeUrl: formData.youtubeUrl || "",
    landlineNo: primaryAddress.phoneNumber || "",
    isCompanyBrand: false, // Assuming true since brand details are required
    brandName: formData.brandName || "",
    brandDescription: formData.description || "",
    brandWebsite: formData.website || "",
    addresses: [
      {
        addressType: "registered",
        line1: primaryAddress.address || "",
        line2: "",
        landmark: primaryAddress.landmark || "",
        city: primaryAddress.city || "",
        state: primaryAddress.state || "",
        postalCode: primaryAddress.postalCode || "",
        country: primaryAddress.country || "",
        isPrimary: true,
        brandIds: [],
      },
    ],
    sellingOn:
      formData?.sellingOn?.filter(Boolean).map((item) => ({
        platform: item?.platform || "",
        url: item?.url || "",
      })) || [],
  };

  // Merge files directly into the data object
  // Company logo files
  if (formData.logo_files && formData.logo_files.length > 0) {
    apiData.logo = formData.logo_files;
  }

  // Brand logo files
  if (formData.brand_logo_files && formData.brand_logo_files.length > 0) {
    apiData.brandLogo = formData.brand_logo_files;
  }

  // Document files - API expects specific keys
  if (gstDoc?.url_files && gstDoc.url_files.length > 0) {
    apiData.gst = gstDoc.url_files;
  }

  if (panDoc?.url_files && panDoc.url_files.length > 0) {
    apiData.pan = panDoc.url_files;
  }

  if (authDoc?.url_files && authDoc.url_files.length > 0) {
    apiData.authorizationLetter = authDoc.url_files;
  }

  if (coiDoc?.url_files && coiDoc.url_files.length > 0) {
    apiData.coiCertificate = coiDoc.url_files;
  }

  if (msmeDoc?.url_files && msmeDoc.url_files.length > 0) {
    apiData.msmeCertificate = msmeDoc.url_files;
  }

  return apiData;
}

/**
 * Transforms API response data to the form data format for editing
 * Also provides default values when no API data is available
 */
export function transformApiResponseToFormData(
  apiData?: CompanyDetailItem,
): FullCompanyFormType {
  // Default values structure
  const defaultValues: FullCompanyFormType = {
    // personal details
    name: "",
    email: "",
    designation: "",
    password: "",
    phoneNumber: "8424847449",
    phoneVerified: true,

    // Step 1
    logo: "",
    logo_files: undefined,
    companyName: "",
    category: "",
    businessType: "",
    establishedIn: "",
    website: "",
    isSubsidiary: "false",
    headquarterLocation: "",
    description: "",

    // Brand details
    brand_logo: undefined,
    brand_logo_files: undefined,
    brandName: "",
    totalSkus: "",
    productCategory: "",
    averageSellingPrice: "2",
    sellingOn: [
      {
        platform: "",
        url: "",
      },
    ],
    instagramUrl: "",
    facebookUrl: "",
    youtubeUrl: "",
    marketingBudget: "",

    // Step 2 (single-address array)
    address: [
      {
        addressType: "registered" as const,
        address: "",
        landmark: "",
        phoneNumber: "",
        country: "",
        state: "",
        city: "",
        postalCode: "",
      },
    ],

    // Step 3 (four documents)
    documents: [
      { type: "coi", number: "", url: "" },
      { type: "pan", number: "", url: "" },
      { type: "gstLicense", number: "", url: "" },
      { type: "msme", number: "", url: "" },
      { type: "brandAuthorisation", number: "", url: "" },
    ],

    // Terms
    agreeTermsConditions: false,
  };

  if (!apiData) {
    return defaultValues;
  }

  // Get the primary address (usually the first one or marked as primary)
  // const primaryAddress =
  //   apiData.addresses?.find((addr) => addr.isPrimary) || apiData.addresses?.[0];

  // Get the first brand from the primary address
  // const primaryBrand = primaryAddress?.brands?.[0];

  // Merge API data with default values
  const mergedData: FullCompanyFormType = {
    ...defaultValues,
    _id: apiData._id || defaultValues._id,
    // Company details - only use properties that exist in CompanyDetailItem
    companyName: apiData.companyName || defaultValues.companyName,
    businessType: apiData.businessType || defaultValues.businessType,
    category: apiData.companyCategory || defaultValues.category,
    website: apiData.website || defaultValues.website,
    isSubsidiary: String(apiData.isCompanyBrand || false),
    headquarterLocation:
      apiData?.headquarterLocation ||
      defaultValues.headquarterLocation ||
      "Empty",
    establishedIn: String(apiData?.establishedIn || "2005-07"),
    description: apiData.description || defaultValues.description,
    instagramUrl: apiData.instagramUrl || defaultValues.instagramUrl,
    facebookUrl: apiData.facebookUrl || defaultValues.facebookUrl,
    youtubeUrl: apiData.youtubeUrl || defaultValues.youtubeUrl,
    marketingBudget: apiData.marketingBudget || defaultValues.marketingBudget,
    brandName: apiData.brandName || defaultValues.brandName,
    totalSkus: apiData.totalSkus || defaultValues.totalSkus,
    productCategory: apiData.productCategory || defaultValues.productCategory,
    averageSellingPrice:
      apiData.averageSellingPrice || defaultValues.averageSellingPrice,
    sellingOn: apiData.sellingOn || defaultValues.sellingOn,
    logo: apiData.logo || defaultValues.logo,
    // brand_logo: apiData.brandLogo || defaultValues.brand_logo,
    brand_logo_files: apiData.brandLogoFiles || defaultValues.brand_logo_files,
    // documents: apiData.documents || defaultValues.documents,
    // agreeTermsConditions: apiData.agreeTermsConditions || defaultValues.agreeTermsConditions,
    // // Address details
    address:
      apiData.addresses.length && apiData._id
        ? [
            ...apiData.addresses.map((address) => ({
              addressType: (address.addressType === "warehouse"
                ? "operational"
                : "registered") as "registered" | "operational",
              address: address.landmark || "empty", // Using landmark as address since line1 doesn't exist
              landmark: address.landmark || "",
              phoneNumber: "8424847449", // phoneNumber doesn't exist in CompanyAddressInfo
              country: address.country || "",
              state: address.state || "",
              city: address.city || "",
              postalCode: address.postalCode || "",
            })),
            {
              addressType: "operational" as "registered" | "operational",
              address: "",
              landmark: "",
              phoneNumber: "",
              country: "",
              state: "",
              city: "",
              postalCode: "",
            },
          ]
        : defaultValues.address,

    // Documents - API doesn't provide document details, so these will be empty
    documents: defaultValues.documents,
  };

  return mergedData;
}
