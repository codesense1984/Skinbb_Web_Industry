import { MODE } from "@/core/types";
import { formatDateForApi } from "@/core/utils";
import type {
  CompanyOnboading,
  CompanyOnboardingSubmitRequest,
} from "@/modules/panel/types/company.type";
import type { FullCompanyFormType } from "../schema/fullCompany.schema";
import { createCompanySchema } from "../schema/fullCompany.schema";
import { LocationService } from "@/core/services/location.service";
import { parse } from "date-fns";

// Constants
// const DEFAULT_ROLE_ID = "6875fc068683bb026013181b";
// const DEFAULT_MONTH = "01";

const ADDRESS_TYPES = {
  REGISTERED: "registered",
  OFFICE: "office",
} as const;

const DOCUMENT_TYPES = {
  COI: "coi",
  PAN: "pan",
  GST_LICENSE: "gstLicense",
  MSME: "msme",
  FSSAI: "fssai",
  DRUG_LICENSE: "drug_license",
  BRAND_AUTHORIZATION: "brandAuthorisation",
} as const;

// Utility functions for safer data access
const safeString = (value: unknown): string => {
  return typeof value === "string" ? value : "";
};

const safeArray = <T>(value: unknown): T[] => {
  return Array.isArray(value) ? (value as T[]) : [];
};

const safeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return false;
};

// const safeFileArray = (value: unknown): File[] => {
//   // return Array.isArray(value) ? (value as File[]) : [];
//   return value as File[];
// };

// Cache for date formatting to avoid redundant operations
const dateFormatCache = new Map<string, string>();

/**
 * Clears the date format cache. Useful for testing or when memory management is needed.
 */
export function clearDateFormatCache(): void {
  dateFormatCache.clear();
}

/**
 * Gets the appropriate schema based on the mode
 * @param mode - The mode (ADD, EDIT, VIEW)
 * @returns The schema with appropriate validation rules
 *
 * @example
 * // For ADD mode - applies full validation
 * const addSchema = getCompanySchema(MODE.ADD);
 *
 * // For EDIT mode - removes validation refinements
 * const editSchema = getCompanySchema(MODE.EDIT);
 *
 * // Usage in form validation
 * const result = addSchema.safeParse(formData);
 * if (!result.success) {
 *   // Handle validation errors
 * }
 */
export function getCompanySchema(
  mode?: string,
  companyOptions?: Array<{ companyName: string }>,
  validateVerificationOnChange: boolean = false,
) {
  return createCompanySchema(
    mode,
    companyOptions,
    validateVerificationOnChange,
  );
}

/**
 * Formats established date from YYYY-MM to MM/YYYY format
 * Uses caching to improve performance for repeated calls
 */
// function formatEstablishedDate(dateString: string): string {
//   if (!dateString?.trim()) return "";

//   const trimmedDate = dateString.trim();

//   // Check cache first
//   if (dateFormatCache.has(trimmedDate)) {
//     return dateFormatCache.get(trimmedDate)!;
//   }

//   let result = trimmedDate;

//   // Handle YYYY-MM format
//   if (trimmedDate.includes("-")) {
//     const [year, month] = trimmedDate.split("-");
//     if (year && month) {
//       result = `${month}/${year}`;
//     }
//   }
//   // Handle MM/YYYY format (already correct) - no change needed
//   // Handle YYYY format (assume January)
//   else if (trimmedDate.length === 4 && /^\d{4}$/.test(trimmedDate)) {
//     result = `${DEFAULT_MONTH}/${trimmedDate}`;
//   }

//   // Cache the result
//   dateFormatCache.set(trimmedDate, result);
//   return result;
// }

// /**
//  * Converts established date from MM/YYYY format to YYYY-MM format for month input
//  * Uses caching to improve performance for repeated calls
//  */
// function convertEstablishedInToMonthFormat(dateString: string): string {
//   if (!dateString?.trim()) return "";

//   const trimmedDate = dateString.trim();

//   // Check cache first
//   if (dateFormatCache.has(trimmedDate)) {
//     return dateFormatCache.get(trimmedDate)!;
//   }

//   let result = trimmedDate;

//   // Handle MM/YYYY format (from API)
//   if (trimmedDate.includes("/")) {
//     const [month, year] = trimmedDate.split("/");
//     if (year && month) {
//       result = `${year}-${month.padStart(2, "0")}`;
//     }
//   }
//   // Handle YYYY-MM format (already correct) - no change needed
//   // Handle YYYY format (assume January)
//   else if (trimmedDate.length === 4 && /^\d{4}$/.test(trimmedDate)) {
//     result = `${trimmedDate}-${DEFAULT_MONTH}`;
//   }

//   // Cache the result
//   dateFormatCache.set(trimmedDate, result);
//   return result;
// }

/**
 * Transforms the form data to the API request format for onboarding submission.
 * Files are merged directly into the data object.
 *
 * @param formData - The form data from the company onboarding form
 * @param roleId - The role ID for the user (defaults to DEFAULT_ROLE_ID)
 * @returns The transformed data in the format expected by the API
 * @throws Error if formData is not provided
 */
// Function to upload files and get URLs
// export async function uploadFormFiles(formData: FullCompanyFormType): Promise<{
//   logoUrl?: string;
//   brandLogoUrl?: string;
// }> {
//   const uploadResults: { logoUrl?: string; brandLogoUrl?: string } = {};

//   try {
//     // Upload company logo
//     if (formData.logo_files && formData.logo_files.length > 0) {
//       const logoFile = formData.logo_files[0];
//       const logoResponse = await apiUploadMedia(logoFile);
//       uploadResults.logoUrl = logoResponse.data.url;
//     }

//     // Upload brand logo
//     if (formData.brand_logo_files && formData.brand_logo_files.length > 0) {
//       const brandLogoFile = formData.brand_logo_files[0];
//       const brandLogoResponse = await apiUploadMedia(brandLogoFile);
//       uploadResults.brandLogoUrl = brandLogoResponse.data.url;
//     }
//   } catch (error) {
//     console.error("Error uploading files:", error);
//     throw new Error("Failed to upload files. Please try again.");
//   }

//   return uploadResults;
// }

export function transformFormDataToApiRequest(
  formData: FullCompanyFormType,
  // roleId: string = DEFAULT_ROLE_ID,
): CompanyOnboardingSubmitRequest {
  if (!formData) {
    throw new Error("Form data is required");
  }

  // Get the first address (assuming it's the registered address)
  const addresses = Array.isArray(formData.address) ? formData.address : [];

  // const landlineNo =
  //   Array.isArray(formData.address) && formData.address.length > 0
  //     ? formData.address.length === 1
  //       ? formData.address[0]?.phoneNumber
  //       : formData.address[formData.address.length - 1]?.phoneNumber
  //     : undefined;

  const primaryAddress =
    formData.mode === MODE.EDIT
      ? addresses[0]
      : addresses.find((addr) => !addr?.addressId);

  // Get document numbers and files - optimized with single pass
  const documents = Array.isArray(formData.documents) ? formData.documents : [];
  const documentMap = new Map<string, (typeof documents)[0]>();

  // Single pass to create document lookup map
  documents.forEach((doc) => {
    if (doc?.type) {
      documentMap.set(doc.type, doc);
    }
  });

  const coiDoc = documentMap.get(DOCUMENT_TYPES.COI);
  const panDoc = documentMap.get(DOCUMENT_TYPES.PAN);
  const gstDoc = documentMap.get(DOCUMENT_TYPES.GST_LICENSE);
  const msmeDoc = documentMap.get(DOCUMENT_TYPES.MSME);
  const fssaiDoc = documentMap.get(DOCUMENT_TYPES.FSSAI);
  const drugLicenseDoc = documentMap.get(DOCUMENT_TYPES.DRUG_LICENSE);
  const authDoc = documentMap.get(DOCUMENT_TYPES.BRAND_AUTHORIZATION);

  const apiData: CompanyOnboardingSubmitRequest = {
    companyId: safeString(formData._id) || null,
    // Required File properties - will be overridden later if files exist
    // gst: new File([], ""),
    // pan: new File([], ""),
    // authorizationLetter: new File([], ""),
    // coiCertificate: new File([], ""),
    // msmeCertificate: new File([], ""),
    ownerName: safeString(formData.name),
    ownerEmail: safeString(formData.email),
    phoneNumber: safeString(formData.phoneNumber),
    designation: safeString(formData.designation),
    // roleId,
    companyName: safeString(formData.companyName),
    companyDescription: safeString(formData.description) || "",
    businessType: safeString(formData.businessType),
    headquartersAddress: safeString(formData.headquarterLocation),
    establishedIn: formData.establishedIn
      ? formatDateForApi(formData.establishedIn)
      : "",
    subsidiaryOfGlobalBusiness: safeBoolean(formData.isSubsidiary),
    companyCategory: safeString(formData.category),
    website: safeString(formData.website),
    websiteUrl: safeString(formData.websiteUrl),
    instagramUrl: safeString(formData.instagramUrl),
    facebookUrl: safeString(formData.facebookUrl),
    youtubeUrl: safeString(formData.youtubeUrl),
    // landlineNo: safeString(landlineNo),
    isCompanyBrand: false, // Assuming true since brand details are required
    brandName: safeString(formData.brandName),
    brandDescription: safeString(formData.description),
    brandWebsite: safeString(formData.website),
    totalSKU: safeString(formData.totalSkus),
    averageSellingPrice: safeString(formData.averageSellingPrice),
    marketingBudget: safeString(formData.marketingBudget),
    brandType: (() => {
      const categoryArray = safeArray(formData.brandType);
      return categoryArray;
    })(),
    addresses: primaryAddress
      ? [
          {
            addressId: safeString(primaryAddress.addressId),
            addressType: primaryAddress.addressType,
            gstNumber: safeString(gstDoc?.number),
            panNumber: safeString(panDoc?.number),
            cinNumber: safeString(coiDoc?.number),
            msmeNumber: safeString(msmeDoc?.number),
            fssai: safeString(fssaiDoc?.number),
            drug_license: safeString(drugLicenseDoc?.number),
            addressLine1: safeString(primaryAddress.address),
            addressLine2: "",
            landlineNumber: safeString(primaryAddress.landlineNumber),
            landmark: safeString(primaryAddress.landmark),
            city: safeString(primaryAddress.city),
            state:
              LocationService.getStateName(
                safeString(primaryAddress.country),
                safeString(primaryAddress.state),
              ) ?? "",

            postalCode: safeString(primaryAddress.postalCode),
            country:
              LocationService.getCountryName(
                safeString(primaryAddress.country),
              ) ?? "",
            isPrimary: formData.isCreatingNewCompany,
            // brandIds: [],
          },
        ]
      : [],
    sellingOn: Array.isArray(formData.sellingOn)
      ? formData.sellingOn.filter(Boolean).map((item) => ({
          platform: safeString(item?.platform),
          url: safeString(item?.url),
        }))
      : [],
  };

  const password = safeString(formData.password);

  if (password) {
    apiData.password = password;
  }

  // Merge files directly into the data object
  // Company logo files - API expects string URL, not File array
  if (formData?.logo_files) {
    // For now, we'll use the first file's name as a placeholder
    // In a real implementation, you'd upload the file and get a URL
    apiData.logo = formData?.logo_files;
  }

  if (formData.brand_logo_files) {
    apiData.brandLogo = formData.brand_logo_files || "";
  }

  // Document files - API expects single File objects
  if (gstDoc?.url_files) {
    apiData.gst = gstDoc?.url_files;
  }

  if (panDoc?.url_files) {
    apiData.pan = panDoc?.url_files;
  }

  if (authDoc?.url_files) {
    apiData.authLetter = authDoc?.url_files;
  }

  if (coiDoc?.url_files) {
    apiData.coiCertificate = coiDoc?.url_files;
  }

  if (msmeDoc?.url_files) {
    apiData.msmeCertificate = msmeDoc?.url_files;
  }

  if (fssaiDoc?.url_files) {
    apiData.fssaiDocument = fssaiDoc?.url_files;
  }

  if (drugLicenseDoc?.url_files) {
    apiData.drugLicenseDocument = drugLicenseDoc?.url_files;
  }

  return apiData;
}

/**
 * Transforms API response data to the form data format for editing.
 * Also provides default values when no API data is available.
 *
 * @param apiData - The API response data (optional)
 * @param extraData - Additional configuration data including mode and disabled flags
 * @returns The transformed data in the format expected by the form
 * @throws Error if mode is not provided in extraData
 */
export function transformApiResponseToFormData(
  apiData?: CompanyOnboading,
  extraData?: {
    disabledCompanyDetails?: boolean;
    isCreatingNewCompany?: boolean;
    disabledCompanyName?: boolean;
    disabledPersonalDetails?: boolean;
    disabledAddressDetails?: boolean;
    mode?: string;
  },
): FullCompanyFormType {
  // Default values structure
  const defaultValues: FullCompanyFormType = {
    // personal details
    name: "",
    email: "",
    designation: "",
    password: "",
    phoneNumber: "",
    phoneVerified: false,
    emailVerified: false,

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
    brandType: [],
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
    marketingBudget: 0,

    // Step 2 (single-address array)
    address: [
      {
        addressId: "",
        addressType: "registered" as const,
        address: "",
        landmark: "",
        landlineNumber: "",
        country: "IN",
        state: "",
        city: "",
        postalCode: "",
      },
    ],

    // Step 3 (documents)
    documents: [
      { type: DOCUMENT_TYPES.COI, number: "", url: "", verified: false },
      { type: DOCUMENT_TYPES.PAN, number: "", url: "", verified: false },
      {
        type: DOCUMENT_TYPES.GST_LICENSE,
        number: "",
        url: "",
        verified: false,
      },
      { type: DOCUMENT_TYPES.MSME, number: "", url: "", verified: true },
      { type: DOCUMENT_TYPES.FSSAI, number: "", url: "", verified: true },
      {
        type: DOCUMENT_TYPES.DRUG_LICENSE,
        number: "",
        url: "",
        verified: true,
      },
      {
        type: DOCUMENT_TYPES.BRAND_AUTHORIZATION,
        number: "",
        url: "",
        verified: true,
      },
    ],

    // Terms
    agreeTermsConditions: false,

    disabledCompanyName: extraData?.disabledCompanyName ?? false,
    disabledCompanyDetails: extraData?.disabledCompanyDetails ?? false,
    disabledPersonalDetails: extraData?.disabledPersonalDetails ?? false,
    disabledAddressDetails: extraData?.disabledAddressDetails ?? false,
    isCreatingNewCompany: extraData?.isCreatingNewCompany ?? false,
    mode: extraData?.mode ?? MODE.ADD,
    isPrimary: false,
  };

  if (!apiData) {
    return defaultValues;
  }
  let mergedData: FullCompanyFormType = {} as FullCompanyFormType;
  // Merge API data with default values
  mergedData = {
    ...defaultValues,
    _id: safeString(apiData.companyId) || defaultValues._id,
    logo: safeString(apiData.logo) || defaultValues.logo,
    // Brand details from first address's brands
    brands: Array.isArray(apiData?.addresses)
      ? apiData.addresses.flatMap((address) =>
          Array.isArray(address?.brands)
            ? address.brands.map((brand) => safeString(brand?.name))
            : [],
        )
      : [],
    // Company details - map to new API response structure
    companyName: safeString(apiData.companyName) || defaultValues.companyName,

    businessType:
      safeString(apiData.businessType) || defaultValues.businessType,
    category: safeString(apiData.companyCategory) || defaultValues.category,

    website: safeString(apiData.website) || defaultValues.website,
    isSubsidiary: String(safeBoolean(apiData.subsidiaryOfGlobalBusiness)),
    headquarterLocation:
      safeString(apiData.headquaterLocation) ||
      defaultValues.headquarterLocation,
    // establishedIn: apiData.establishedIn
    //   ? new Date(safeString(apiData.establishedIn))
    //   : defaultValues.establishedIn,
    establishedIn: apiData.establishedIn
      ? parse(apiData.establishedIn, "dd/MM/yyyy", new Date())
      : defaultValues.establishedIn,
    description:
      safeString(apiData.companyDescription) || defaultValues.description,
    isCreatingNewCompany: defaultValues.isCreatingNewCompany,
    address:
      Array.isArray(apiData.addresses) && apiData.addresses.length > 0
        ? [
            ...apiData.addresses.map((address) => ({
              addressType: (address?.addressType === ADDRESS_TYPES.REGISTERED ||
              address?.addressType === ADDRESS_TYPES.OFFICE
                ? address.addressType
                : ADDRESS_TYPES.REGISTERED) as "registered" | "office",
              address: safeString(address?.addressLine1),
              landmark: safeString(address?.landmark),
              landlineNumber: safeString(address?.landlineNumber),
              country: LocationService.getCountryIsoCodeByName(
                safeString(address?.country),
              ),
              state: LocationService.getStateIsoCodeByName(
                safeString(address?.state),
              ),
              city: safeString(address?.city),
              postalCode: safeString(address?.postalCode),
              addressId: safeString(address?.addressId),
            })),
            ...(defaultValues.mode === MODE.ADD
              ? [
                  {
                    addressId: "",
                    addressType: "office" as const,
                    address: "",
                    landmark: "",
                    landlineNumber: "",
                    country: "IN",
                    state: "",
                    city: "",
                    postalCode: "",
                  },
                ]
              : []),
          ]
        : defaultValues.address,
  };
  const address = apiData.addresses[0];

  // if (address) {
  //   mergedData.documents = [
  //     {
  //       type: DOCUMENT_TYPES.COI,
  //       number: "",
  //       url: "",
  //       verified: false,
  //     },
  //     {
  //       type: DOCUMENT_TYPES.PAN,
  //       number: "",
  //       url: "",
  //       verified: false,
  //     },
  //     {
  //       type: DOCUMENT_TYPES.GST_LICENSE,
  //       number: "",
  //       url: "",
  //       verified: false,
  //     },
  //     {
  //       type: DOCUMENT_TYPES.MSME,
  //       number: "",
  //       url: "",
  //       verified: false,
  //     },
  //     {
  //       type: DOCUMENT_TYPES.BRAND_AUTHORIZATION,
  //       number: "",
  //       url: "",
  //       verified: false,
  //     },
  //   ];
  // }

  if (mergedData.mode === MODE.EDIT) {
    mergedData.category =
      safeString(apiData.companyCategory) || defaultValues.category;
    mergedData.agreeTermsConditions = true;

    // Address data is already set in the general merge above, no need to set it again
    // This was causing the form values to be overwritten

    const brand = apiData?.addresses?.[0]?.brands?.[0];
    const owner = apiData?.addresses?.[0]?.brands?.[0]?.owner;

    if (brand && address && owner) {
      mergedData.brand_logo = brand.logoImage;
      mergedData.brandName = brand.name;
      mergedData.totalSkus = brand.totalSKU.toString();
      mergedData.brandType = brand.brandType;
      //mergedData.averageSellingPrice = brand.averageSellingPrice.();
      mergedData.marketingBudget = Number(brand.marketingBudget);
      mergedData.sellingOn = brand.sellingOn;
      mergedData.instagramUrl = brand.instagramUrl;
      mergedData.facebookUrl = brand.facebookUrl;
      mergedData.youtubeUrl = brand.youtubeUrl;
      mergedData.websiteUrl = brand.websiteUrl;
      // mergedData.description = brand.aboutTheBrand;
      mergedData.documents = [
        {
          type: DOCUMENT_TYPES.COI,
          number: address.cinNumber,
          url: address.coiCertificate,
          verified: true,
        },
        {
          type: DOCUMENT_TYPES.PAN,
          number: address.panNumber,
          url: address.panDocument,
          verified: true,
        },
        {
          type: DOCUMENT_TYPES.GST_LICENSE,
          number: address.gstNumber,
          url: address.gstDocument,
          verified: true,
        },
        {
          type: DOCUMENT_TYPES.MSME,
          number: address.msmeNumber,
          url: address.msmeCertificate,
          verified: false,
        },
        {
          type: DOCUMENT_TYPES.FSSAI,
          number: address.fssai || "",
          url: address.fssaiDocument || "",
          verified: false,
        },
        {
          type: DOCUMENT_TYPES.DRUG_LICENSE,
          number: address.drug_license || "",
          url: address.drugLicenseDocument || "",
          verified: false,
        },
        {
          type: DOCUMENT_TYPES.BRAND_AUTHORIZATION,
          number: "",
          url: brand.authorizationLetter,
          verified: true,
        },
      ];

      mergedData.name = owner.ownerUser;
      mergedData.email = owner.ownerEmail;
      mergedData.designation =
        owner.ownerDesignation ||
        safeString(apiData.designation) ||
        defaultValues.designation;
      mergedData.phoneNumber = owner.ownerPhone;
      mergedData.password = owner.ownerPassword;
      mergedData.phoneVerified = true;
      mergedData.emailVerified = true;
    }
  }

  return mergedData;
}
