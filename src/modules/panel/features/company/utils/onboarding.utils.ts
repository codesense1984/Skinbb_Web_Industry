import type {
  CompanyOnboading,
  CompanyOnboardingSubmitRequest,
} from "@/modules/panel/types/company.type";
import type { FullCompanyFormType } from "../schema/fullCompany.schema";

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
): CompanyOnboardingSubmitRequest {
  // Get the first address (assuming it's the registered address)
  const primaryAddress = formData.address.find((addr) => !addr.addressId);

  // Get document numbers and files
  const documents = formData.documents || [];
  const coiDoc = documents.find((doc) => doc.type === "coi");
  const panDoc = documents.find((doc) => doc.type === "pan");
  const gstDoc = documents.find((doc) => doc.type === "gstLicense");
  const msmeDoc = documents.find((doc) => doc.type === "msme");
  const authDoc = documents.find((doc) => doc.type === "brandAuthorisation");

  const apiData: CompanyOnboardingSubmitRequest = {
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
    subsidiaryOfGlobalBusiness: formData.isSubsidiary === "true",
    companyCategory: formData.category || "",
    cinNumber: coiDoc?.number || "",
    msmeNumber: msmeDoc?.number || "",
    website: formData.website || "",
    instagramUrl: formData.instagramUrl || "",
    facebookUrl: formData.facebookUrl || "",
    youtubeUrl: formData.youtubeUrl || "",
    landlineNo: formData.phoneNumber || "",
    isCompanyBrand: false, // Assuming true since brand details are required
    brandName: formData.brandName || "",
    brandDescription: formData.description || "",
    brandWebsite: formData.website || "",
    addresses: primaryAddress
      ? [
          {
            addressType: primaryAddress.addressType,
            gstNumber: gstDoc?.number || "",
            panNumber: panDoc?.number || "",
            line1: primaryAddress.address || "",
            line2: "",
            landmark: primaryAddress.landmark || "",
            city: primaryAddress.city || "",
            state: primaryAddress.state || "",
            postalCode: primaryAddress.postalCode || "",
            country: primaryAddress.country || "",
            isPrimary: false,
            // brandIds: [],
          },
        ]
      : [],
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
        addressId: "",
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
    logo: apiData?.brandLogo || defaultValues.brand_logo,
    // logo: apiData?.logo || defaultValues.logo,
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
              addressType: address.addressType,
              address: address.landmark || "",
              landmark: address.landmark || "",
              phoneNumber: apiData.landlineNo || "",
              country: address.country || "",
              state: address.state || "",
              city: address.city || "",
              postalCode: address.postalCode || "",
              addressId: address.addressId || "",
            })),
            {
              addressId: "",
              addressType: "office",
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

  return {
    name: "Rohit Sharma",
    email: "rohit.sharma@example.com",
    designation: "Founder & CEO",
    password: "Pass@1234",
    phoneNumber: "8424847449",
    phoneVerified: true,
    logo: "C:\\fakepath\\is3.png",
    logo_files: undefined,
    companyName: "TechNova Solutions Pvt. Ltd.",
    category: "principal",
    businessType: "public",
    establishedIn: "2007-06",
    website: "https://www.technova.com",
    isSubsidiary: "true",
    headquarterLocation: "London",
    description:
      "TechNova Solutions is a leading provider of AI-driven business automation tools, helping enterprises streamline operations and accelerate growth.",
    brand_logo: "",
    brand_logo_files: undefined,
    brandName: "NovaAI",
    totalSkus: "40",
    productCategory: ["68652e98d559321c67d22fd8", "68652e84d559321c67d22fc2"],
    averageSellingPrice: "40",
    sellingOn: [
      {
        platform: "flipkart",
        url: "https://google.com",
      },
    ],
    instagramUrl: "",
    facebookUrl: "",
    youtubeUrl: "",
    marketingBudget: "49999",
    address: [
      {
        addressType: "registered",
        address: "5th Floor, Tech Park, Whitefield",
        landmark: "Near ITPL",
        phoneNumber: "8045671234",
        country: "india",
        state: "delhi",
        city: "Mumbai",
        postalCode: "400019",
      },
    ],
    documents: [
      {
        type: "coi",
        number: "785",
        // url: "C:\\fakepath\\pdf-sample_2.pdf",
        // url_files: {
        //   "0": {},
        // },
      },
      {
        type: "pan",
        number: "747",
        // url: "C:\\fakepath\\pdf-sample_2.pdf",
        // url_files: {
        //   "0": {},
        // },
      },
      {
        type: "gstLicense",
        number: "922",
        url: "",
      },
      {
        type: "msme",
        number: "720",
        url: "",
      },
      {
        type: "brandAuthorisation",
        number: "",
        // url: "C:\\fakepath\\pdf-sample_2.pdf",
        // url_files: {
        //   "0": {},
        // },
      },
    ],
    agreeTermsConditions: true,
  };
}
