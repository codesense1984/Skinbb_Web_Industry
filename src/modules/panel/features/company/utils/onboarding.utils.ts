import type { FullCompanyFormType } from "../schema/fullCompany.schema";
import type {
  OnboardingSubmitRequest,
  CompanyDetailItem,
  CompanyAddressInfo,
} from "@/modules/panel/types/company.type";

/**
 * Transforms the form data to the API request format for onboarding submission
 */
export function transformFormDataToApiRequest(
  formData: FullCompanyFormType,
  roleId: string = "6875fc068683bb026013181b", // Default role ID, can be made configurable
): OnboardingSubmitRequest {
  // Get the first address (assuming it's the registered address)
  const primaryAddress = formData.address?.[0] || {};

  // Get brand logo ID if available
  const brandLogoId = formData.brand_logo?.[0] || "";

  // Get document numbers
  const documents = formData.documents || [];
  const coiDoc = documents.find((doc) => doc.type === "coi");
  const panDoc = documents.find((doc) => doc.type === "pan");
  const gstDoc = documents.find((doc) => doc.type === "gstLicense");
  const msmeDoc = documents.find((doc) => doc.type === "msme");

  return {
    ownerName: formData.name || "",
    ownerEmail: formData.email || "",
    phoneNumber: formData.phoneNumber || "",
    password: formData.password || "",
    roleId,
    companyName: formData.companyName || "",
    companyDescription: formData.description || "",
    businessType: formData.businessType || "",
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
    isCompanyBrand: true, // Assuming true since brand details are required
    brandName: formData.brandName || "",
    brandDescription: formData.description || "",
    brandWebsite: formData.website || "",
    // brandLogo: brandLogoId,
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
}

/**
 * Transforms API response data to the form data format for editing
 */
export function transformApiResponseToFormData(
  apiData?: CompanyDetailItem,
): Partial<FullCompanyFormType> {
  if (!apiData) {
    // Return default values if no apiData is provided
    return {
      _id: "",
      companyName: "",
      businessType: "",
      category: "",
      website: "",
      isSubsidiary: "false",
      brandName: "",
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
      documents: [
        { type: "coi", number: "", url: "" },
        { type: "pan", number: "", url: "" },
        { type: "gstLicense", number: "", url: "" },
        { type: "msme", number: "", url: "" },
        { type: "brandAuthorisation", number: "", url: "" },
      ],
    };
  }

  // Get the primary address (usually the first one or marked as primary)
  // const primaryAddress =
  //   apiData.addresses?.find((addr) => addr.isPrimary) || apiData.addresses?.[0];

  // Get the first brand from the primary address
  // const primaryBrand = primaryAddress?.brands?.[0];

  return {
    _id: apiData._id || "",
    // Company details
    companyName: apiData.companyName || "",
    businessType: apiData.businessType || "",
    category: apiData.companyCategory || "",
    website: apiData.website || "",
    isSubsidiary: String(apiData.isCompanyBrand || false),

    // Brand details
    brandName: "",

    // Address details
    address: apiData.addresses.length
      ? [
          ...apiData.addresses.map((address) => ({
            addressType: "registered" as const,
            address: address?.line1 || "empty",
            landmark: address.landmark || "",
            phoneNumber: address?.phoneNumber || "8424847449",
            country: address.country || "",
            state: address.state || "",
            city: address.city || "",
            postalCode: address.postalCode || "",
          })),
          {
            addressType: "" as const,
            address: "",
            landmark: "",
            phoneNumber: "",
            country: "",
            state: "",
            city: "",
            postalCode: "",
          },
        ]
      : [
          {
            addressType: "" as const,
            address: "",
            landmark: "",
            phoneNumber: "",
            country: "",
            state: "",
            city: "",
            postalCode: "",
          },
        ],
    //  [
    //     {
    //       addressType: "registered" as const,
    //       address: "",
    //       landmark: "",
    //       phoneNumber: "",
    //       country: "",
    //       state: "",
    //       city: "",
    //       postalCode: "",
    //     },
    //   ],

    // Documents - API doesn't provide document details, so these will be empty
    documents: [
      { type: "coi", number: "", url: "" },
      { type: "pan", number: "", url: "" },
      { type: "gstLicense", number: "", url: "" },
      { type: "msme", number: "", url: "" },
      { type: "brandAuthorisation", number: "", url: "" },
    ],

    // Other fields that API doesn't provide will use default values
    // Personal details, logo, brand_logo, etc. will need to be filled separately
  };
}
