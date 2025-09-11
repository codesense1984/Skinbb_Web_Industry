import type { CompanyOnboading } from "@/modules/panel/types/company.type";
import type { CompanyEditFormType } from "../schema/companyEdit.schema";

// Transform API response to form data for company edit
export function transformApiResponseToCompanyEditFormData(
  data?: CompanyOnboading,
): CompanyEditFormType {
  if (!data) {
    return {
      _id: "",
      companyName: "",
      category: "",
      businessType: "",
      establishedIn: "",
      website: "",
      isSubsidiary: "false",
      headquarterLocation: "",
      description: "",
      logo: "",
      logo_files: undefined,
      address: [
        {
          addressId: "",
          addressType: "registered",
          address: "",
          landmark: "",
          phoneNumber: "",
          country: "",
          state: "",
          city: "",
          postalCode: "",
        },
      ],
    };
  }

  return {
    _id: data._id || "",
    companyName: data.companyName || "",
    category: data.companyCategory || "",
    businessType: data.businessType || "",
    establishedIn: data.establishedIn || "",
    website: data.website || "",
    isSubsidiary: data.subsidiaryOfGlobalBusiness ? "true" : "false",
    headquarterLocation: "", // Not available in CompanyOnboading type
    description: "", // Not available in CompanyOnboading type
    logo: data.logo || data.brandLogo || "",
    logo_files: undefined,
    address: data.addresses?.map((addr) => ({
      addressId: addr.addressId || "",
      addressType: addr.addressType || "registered",
      address: "", // Not available in CompanyAddressInfo type
      landmark: addr.landmark || "",
      phoneNumber: "",
      country: addr.country || "",
      state: addr.state || "",
      city: addr.city || "",
      postalCode: addr.postalCode || "",
    })) || [
      {
        addressId: "",
        addressType: "registered",
        address: "",
        landmark: "",
        phoneNumber: "",
        country: "",
        state: "",
        city: "",
        postalCode: "",
      },
    ],
  };
}

// Transform form data to API request for company edit
export function transformCompanyEditFormDataToApiRequest(
  data: CompanyEditFormType,
): any {
  const formData = new FormData();

  // Add basic company information
  if (data._id) formData.append("_id", data._id);
  if (data.companyName) formData.append("companyName", data.companyName);
  if (data.category) formData.append("category", data.category);
  if (data.businessType) formData.append("businessType", data.businessType);
  if (data.establishedIn)
    formData.append("establishedIn", String(data.establishedIn));
  if (data.website) formData.append("website", data.website);
  if (data.isSubsidiary) formData.append("isSubsidiary", data.isSubsidiary);
  if (data.headquarterLocation)
    formData.append("headquarterLocation", data.headquarterLocation);
  if (data.description) formData.append("description", data.description);

  // Add logo file if present
  if (data.logo_files && data.logo_files.length > 0) {
    formData.append("logo", data.logo_files[0]);
  } else if (data.logo) {
    formData.append("logo", data.logo);
  }

  // Add addresses
  if (data.address && data.address.length > 0) {
    data.address.forEach((addr, index) => {
      if (addr.addressId)
        formData.append(`addresses[${index}][addressId]`, addr.addressId);
      if (addr.addressType)
        formData.append(`addresses[${index}][addressType]`, addr.addressType);
      if (addr.address)
        formData.append(`addresses[${index}][address]`, addr.address);
      if (addr.landmark)
        formData.append(`addresses[${index}][landmark]`, addr.landmark);
      if (addr.phoneNumber)
        formData.append(`addresses[${index}][phoneNumber]`, addr.phoneNumber);
      if (addr.country)
        formData.append(`addresses[${index}][country]`, addr.country);
      if (addr.state) formData.append(`addresses[${index}][state]`, addr.state);
      if (addr.city) formData.append(`addresses[${index}][city]`, addr.city);
      if (addr.postalCode)
        formData.append(`addresses[${index}][postalCode]`, addr.postalCode);
    });
  }

  return formData;
}
