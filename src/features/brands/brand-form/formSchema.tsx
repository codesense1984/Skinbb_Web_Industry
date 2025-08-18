import type { FormFieldConfig } from "@/core/components/ui/form-input";

export type BrandFormData = {
  brandName: string;
  businessType: string;
  category: string;
  registeredBusinessNumber: string;
  taxIdNumber: string;
  establishedIn: string;
  website: string;
  description: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  sendPassword: boolean;
  password: string;
  confirmPassword: string;
  country: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;

  certificate_of_incorporation: string;
  certificate_of_incorporation_files: string;
  letter_of_authorization: string;
  letter_of_authorization_files: string;
  business_license: string;
  business_license_files: string;
  logo_files: File[];
  logo: string;
};

export const defaultValues = {
  brandName: "",
  businessType: "",
  category: "",
  registeredBusinessNumber: "",
  taxIdNumber: "",
  establishedIn: "",
  website: "",
  description: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNo: "",
  sendPassword: false,
  password: "",
  confirmPassword: "",
  country: "",
  state: "",
  city: "",
  addressLine1: "",
  addressLine2: "",
  postalCode: "",
  certificate_of_incorporation: "",
  letter_of_authorization: "",
  business_license: "",
  logo: "",
  logo_files: [],
};

export type BrandFormSchema = Record<string, FormFieldConfig<BrandFormData>[]>;

export const brandFormSchema: BrandFormSchema = {
  uploadImage: [
    {
      type: "file",
      name: "logo",
      label: "Logo",
    },
  ],

  brand_information: [
    {
      type: "text",
      name: "brandName",
      label: "Brand Name",
      placeholder: "Enter brand name",
      rules: {
        required: "Brand is required",
      },
    },
    {
      type: "select",
      name: "businessType",
      label: "Business Type",
      placeholder: "Select business type",
      options: [
        {
          value: "clinic",
          label: "Dermatology Clinic",
        },
        {
          value: "pharmacy",
          label: "Pharmacy",
        },
        {
          value: "medspa",
          label: "Medical Spa",
        },
        {
          value: "retail_store",
          label: "Retail Store",
        },
        {
          value: "online_store",
          label: "Online Store",
        },
        {
          value: "hospital",
          label: "Hospital Dermatology Department",
        },
        {
          value: "distributor",
          label: "Distributor / Wholesaler",
        },
        {
          value: "manufacturer",
          label: "Brand Manufacturer",
        },
        {
          value: "influencer",
          label: "Skin Influencer / Content Creator",
        },
        {
          value: "salon",
          label: "Beauty Salon",
        },
      ],
    },
    {
      type: "select",
      name: "category",
      label: "Category",
      placeholder: "Enter category",
      options: [
        {
          value: "prescription",
          label: "Prescription Dermatology Brands",
        },
        {
          value: "medical_grade",
          label: "Medical-Grade / Cosmeceutical Brands",
        },
        {
          value: "otc",
          label: "Over-the-Counter (OTC) Dermatology Brands",
        },
        {
          value: "natural_organic",
          label: "Natural / Organic Dermatology Brands",
        },
        {
          value: "cosmetic_aesthetic",
          label: "Cosmetic Dermatology / Aesthetic Brands",
        },
        {
          value: "condition_specific",
          label: "Therapeutic / Condition-Specific Brands",
        },
      ],
    },
    {
      type: "text",
      name: "registeredBusinessNumber",
      label: "Registered Business Number",
      placeholder: "Enter registered business number",
    },
    {
      type: "text",
      name: "taxIdNumber",
      label: "Tax Identification Number",
      placeholder: "Enter tax identification number",
    },
    {
      type: "text",
      name: "establishedIn",
      label: "Established In",
      placeholder: "Enter established in",
    },
    {
      type: "text",
      name: "website",
      label: "Website",
      placeholder: "Enter website",
      className: "md:col-span-3",
    },
    {
      type: "textarea",
      name: "description",
      label: "Description",
      placeholder: "Enter description",
      className: "md:col-span-3",
    },
  ],
  personal_information: [
    {
      type: "text",
      name: "firstName",
      label: "First Name",
      placeholder: "Enter first name",
    },
    {
      type: "text",
      name: "lastName",
      label: "Last Name",
      placeholder: "Enter last name",
    },
    {
      type: "text",
      name: "email",
      label: "Email",
      placeholder: "Enter email",
    },
    {
      type: "text",
      name: "phoneNo",
      label: "Phone No",
      placeholder: "Enter phone no",
    },
  ],
  password: [
    {
      type: "checkbox",
      name: "sendPassword",
      label: "Send the password via email",
      className: "md:col-span-3",
    },
    {
      type: "password",
      name: "password",
      label: "Password",
      placeholder: "Enter password",
    },
    {
      type: "password",
      name: "confirmPassword",
      label: "Confirm Password",
      placeholder: "Confirm password",
    },
  ],
  address: [
    {
      type: "select",
      name: "country",
      label: "Country",
      placeholder: "Select country",
      options: [
        { label: "India", value: "IN" },
        { label: "United States", value: "US" },
      ],
    },
    {
      type: "select",
      name: "state",
      label: "State",
      placeholder: "Select state",
      options: [
        { label: "Delhi", value: "DL" },
        { label: "California", value: "CA" },
      ],
    },
    { type: "text", name: "city", label: "City", placeholder: "Enter city" },
    {
      type: "text",
      name: "addressLine1",
      label: "Line 1",
      placeholder: "Enter address line 1",
    },
    {
      type: "text",
      name: "addressLine2",
      label: "Line 2",
      placeholder: "Enter address line 2",
    },
    {
      type: "text",
      name: "postalCode",
      label: "Postal Code",
      placeholder: "Enter postal code",
    },
  ],
  legal_documents: [
    {
      type: "file",
      name: "certificate_of_incorporation",
      label: "Certificate of Incorporation",
    },
    {
      type: "file",
      name: "business_license",
      label: "Business License",
    },
    {
      type: "file",
      name: "letter_of_authorization",
      label: "Letter of authorization",
    },
  ],
};
