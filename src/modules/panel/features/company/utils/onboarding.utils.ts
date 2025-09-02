import type { FullCompanyFormType } from "../schema/fullCompany.schema";
import type {
  CompanyOnboardingSubmitRequest,
  CompanyOnboading,
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
 * Converts established date from MM/YYYY format to YYYY-MM format for month input
 */
function convertEstablishedInToMonthFormat(dateString: string): string {
  if (!dateString) return "";

  // Handle MM/YYYY format (from API)
  if (dateString.includes("/")) {
    const [month, year] = dateString.split("/");
    return `${year}-${month.padStart(2, "0")}`;
  }

  // Handle YYYY-MM format (already correct)
  if (dateString.includes("-")) {
    return dateString;
  }

  // Handle YYYY format (assume January)
  if (dateString.length === 4) {
    return `${dateString}-01`;
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
): CompanyOnboardingSubmitRequest & Record<string, unknown> {
  // Get the first address (assuming it's the registered address)
  const primaryAddress = formData.address?.[0] || {};

  // Get document numbers and files
  const documents = formData.documents || [];
  const coiDoc = documents.find((doc) => doc.type === "coi");
  const panDoc = documents.find((doc) => doc.type === "pan");
  const gstDoc = documents.find((doc) => doc.type === "gstLicense");
  const msmeDoc = documents.find((doc) => doc.type === "msme");
  const authDoc = documents.find((doc) => doc.type === "brandAuthorisation");

  const apiData: CompanyOnboardingSubmitRequest & Record<string, unknown> = {
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
  apiData?: CompanyOnboading,
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
    productCategory: [],
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

  // Merge API data with default values
  const mergedData: FullCompanyFormType = {
    ...defaultValues,
    _id: apiData._id || defaultValues._id,
    brand_logo: apiData?.brandLogo || defaultValues.brand_logo,
    logo: apiData?.logo || defaultValues.logo,
    brands:
      apiData?.addresses?.flatMap(
        (address) => address.brands?.map((brand) => brand.name) || [],
      ) || [],
    // Company details - map to new API response structure
    companyName: apiData.companyName || defaultValues.companyName,
    businessType: apiData.businessType || defaultValues.businessType,
    category: apiData.companyCategory || defaultValues.category,
    website: apiData.website || defaultValues.website,
    isSubsidiary: String(apiData.subsidiaryOfGlobalBusiness || false),
    headquarterLocation: defaultValues.headquarterLocation,
    establishedIn: apiData.establishedIn
      ? convertEstablishedInToMonthFormat(apiData.establishedIn)
      : defaultValues.establishedIn,
    description: defaultValues.description,
    address:
      apiData.addresses && apiData.addresses.length > 0
        ? [
            ...apiData.addresses.map((address) => ({
              addressType: (address.addressType === "warehouse"
                ? "operational"
                : "registered") as "registered" | "operational",
              address: address.landmark || "",
              landmark: address.landmark || "",
              phoneNumber: apiData.landlineNo || "",
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
  };

  return mergedData;
}
