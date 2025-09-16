import type { FormFieldConfig } from "@/core/components/ui/form-input";

// NEW BRAND FORM DATA TYPE BASED ON IMAGES
export type BrandFormData = {
  // Brand Logo
  brand_logo_files: File[];
  brand_logo: string;

  // Brand Information
  brand_name: string;
  description: string;
  total_skus: string;
  marketing_budget: string;
  product_category: string;
  average_selling_price: string;

  // Social Media URLs (Optional)
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;

  // Selling Platforms
  sellingOn: Array<{
    platform: string;
    url: string;
  }>;

  // Brand Authorization Letter
  brand_authorization_letter_files: File[];
  brand_authorization_letter: string;
};

// OLD BRAND FORM DATA TYPE - COMMENTED OUT
// export type BrandFormData = {
//   brandName: string;
//   businessType: string;
//   category: string;
//   registeredBusinessNumber: string;
//   taxIdNumber: string;
//   establishedIn: string;
//   website: string;
//   description: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNo: string;
//   sendPassword: boolean;
//   password: string;
//   confirmPassword: string;
//   country: string;
//   state: string;
//   city: string;
//   addressLine1: string;
//   addressLine2: string;
//   postalCode: string;

//   certificate_of_incorporation: string;
//   certificate_of_incorporation_files: string;
//   letter_of_authorization: string;
//   letter_of_authorization_files: string;
//   business_license: string;
//   business_license_files: string;
//   logo_files: File[];
//   logo: string;
// };

// NEW DEFAULT VALUES BASED ON IMAGES
export const defaultValues: BrandFormData = {
  // Brand Logo
  brand_logo_files: [],
  brand_logo: "",

  // Brand Information
  brand_name: "",
  description: "",
  total_skus: "",
  marketing_budget: "",
  product_category: "",
  average_selling_price: "2",

  // Social Media URLs (Optional)
  instagram_url: "",
  facebook_url: "",
  youtube_url: "",

  // Selling Platforms
  sellingOn: [],

  // Brand Authorization Letter
  brand_authorization_letter_files: [],
  brand_authorization_letter: "",
};

// OLD DEFAULT VALUES - COMMENTED OUT
// export const defaultValues = {
//   brandName: "",
//   businessType: "",
//   category: "",
//   registeredBusinessNumber: "",
//   taxIdNumber: "",
//   establishedIn: "",
//   website: "",
//   description: "",
//   firstName: "",
//   lastName: "",
//   email: "",
//   phoneNo: "",
//   sendPassword: false,
//   password: "",
//   confirmPassword: "",
//   country: "",
//   state: "",
//   city: "",
//   addressLine1: "",
//   addressLine2: "",
//   postalCode: "",
//   certificate_of_incorporation: "",
//   letter_of_authorization: "",
//   business_license: "",
//   logo: "",
//   logo_files: [],
// };

export type BrandFormSchema = Record<string, FormFieldConfig<BrandFormData>[]>;

// NEW BRAND FORM SCHEMA BASED ON IMAGES
export const brandFormSchema: BrandFormSchema = {
  uploadbrandImage: [
    {
      type: "file",
      name: "brand_logo_files",
      label: "Brand Logo",
      placeholder: "Upload brand logo",
    },
  ],

  brand_information: [
    {
      type: "text",
      name: "brand_name",
      label: "Brand Name",
      placeholder: "Enter brand name",
      rules: {
        required: "Brand name is required",
      },
    },
    {
      type: "rich_text",
      name: "description",
      label: "Description",
      placeholder: "Enter brand description",
      className: "col-span-full",
    },
    {
      type: "text",
      name: "total_skus",
      label: "Total No of SKUs",
      placeholder: "Enter number of SKUs",
    },
    {
      type: "text",
      name: "marketing_budget",
      label: "Marketing Budget",
      placeholder: "Enter marketing budget",
    },
    {
      type: "select",
      name: "product_category",
      label: "Product Category",
      placeholder: "Select product category",
      options: [], // Will be populated dynamically
    },
    // {
    //   type: "text",
    //   name: "average_selling_price",
    //   label: "Average Selling Price (ASP)",
    //   placeholder: "Enter average selling price",
    // },
  ],

  social_media_urls: [
    {
      type: "text",
      name: "instagram_url",
      label: "Instagram URL (Optional)",
      placeholder: "https://instagram.com/yourbrand",
    },
    {
      type: "text",
      name: "facebook_url",
      label: "Facebook URL (Optional)",
      placeholder: "https://facebook.com/yourbrand",
    },
    {
      type: "text",
      name: "youtube_url",
      label: "YouTube URL (Optional)",
      placeholder: "https://youtube.com/yourchannel",
    },
  ],

  selling_platforms: [
    {
      type: "select",
      name: "platform" as keyof BrandFormData,
      label: "Platform",
      placeholder: "Select...",
      options: [
        { label: "Amazon", value: "amazon" },
        { label: "Flipkart", value: "flipkart" },
        { label: "Myntra", value: "myntra" },
        { label: "Nykaa", value: "nykaa" },
        { label: "Purplle", value: "purplle" },
        { label: "Other", value: "other" },
      ],
    },
    {
      type: "text",
      name: "url" as keyof BrandFormData,
      label: "Platform URL",
      placeholder: "e.g., https://amazon.in, https://flipkart.co",
    },
  ],

  brand_authorization_letter: [
    {
      type: "file",
      name: "brand_authorization_letter_files",
      label: "Upload Brand Authorisation Letter",
      placeholder: "Upload file",
    },
  ],
};

// OLD BRAND FORM SCHEMA - COMMENTED OUT
// export const brandFormSchema: BrandFormSchema = {
//   uploadImage: [
//     {
//       type: "file",
//       name: "logo",
//       label: "Logo",
//     },
//   ],

//   brand_information: [
//     {
//       type: "text",
//       name: "brandName",
//       label: "Brand Name",
//       placeholder: "Enter brand name",
//       rules: {
//         required: "Brand is required",
//       },
//     },
//     {
//       type: "select",
//       name: "businessType",
//       label: "Business Type",
//       placeholder: "Select business type",
//       options: [
//         {
//           value: "clinic",
//           label: "Dermatology Clinic",
//         },
//         {
//           value: "pharmacy",
//           label: "Pharmacy",
//         },
//         {
//           value: "medspa",
//           label: "Medical Spa",
//         },
//         {
//           value: "retail_store",
//           label: "Retail Store",
//         },
//         {
//           value: "online_store",
//           label: "Online Store",
//         },
//         {
//           value: "hospital",
//           label: "Hospital Dermatology Department",
//         },
//         {
//           value: "distributor",
//           label: "Distributor / Wholesaler",
//         },
//         {
//           value: "manufacturer",
//           label: "Brand Manufacturer",
//         },
//         {
//           value: "influencer",
//           label: "Skin Influencer / Content Creator",
//         },
//         {
//           value: "salon",
//           label: "Beauty Salon",
//         },
//       ],
//     },
//     {
//       type: "select",
//       name: "category",
//       label: "Category",
//       placeholder: "Enter category",
//       options: [
//         {
//           value: "prescription",
//           label: "Prescription Dermatology Brands",
//         },
//         {
//           value: "medical_grade",
//           label: "Medical-Grade / Cosmeceutical Brands",
//         },
//         {
//           value: "otc",
//           label: "Over-the-Counter (OTC) Dermatology Brands",
//         },
//         {
//           value: "natural_organic",
//           label: "Natural / Organic Dermatology Brands",
//         },
//         {
//           value: "cosmetic_aesthetic",
//           label: "Cosmetic Dermatology / Aesthetic Brands",
//         },
//         {
//           value: "condition_specific",
//           label: "Therapeutic / Condition-Specific Brands",
//         },
//       ],
//     },
//     {
//       type: "text",
//       name: "registeredBusinessNumber",
//       label: "Registered Business Number",
//       placeholder: "Enter registered business number",
//     },
//     {
//       type: "text",
//       name: "taxIdNumber",
//       label: "Tax Identification Number",
//       placeholder: "Enter tax identification number",
//     },
//     {
//       type: "text",
//       name: "establishedIn",
//       label: "Established In",
//       placeholder: "Enter established in",
//     },
//     {
//       type: "text",
//       name: "website",
//       label: "Website",
//       placeholder: "Enter website",
//       className: "md:col-span-3",
//     },
//     {
//       type: "textarea",
//       name: "description",
//       label: "Description",
//       placeholder: "Enter description",
//       className: "md:col-span-3",
//     },
//   ],
//   personal_information: [
//     {
//       type: "text",
//       name: "firstName",
//       label: "First Name",
//       placeholder: "Enter first name",
//     },
//     {
//       type: "text",
//       name: "lastName",
//       label: "Last Name",
//       placeholder: "Enter last name",
//     },
//     {
//       type: "text",
//       name: "email",
//       label: "Email",
//       placeholder: "Enter email",
//     },
//     {
//       type: "text",
//       name: "phoneNo",
//       label: "Phone No",
//       placeholder: "Enter phone no",
//     },
//   ],
//   password: [
//     {
//       type: "checkbox",
//       name: "sendPassword",
//       label: "Send the password via email",
//       className: "md:col-span-3",
//     },
//     {
//       type: "password",
//       name: "password",
//       label: "Password",
//       placeholder: "Enter password",
//     },
//     {
//       type: "password",
//       name: "confirmPassword",
//       label: "Confirm Password",
//       placeholder: "Confirm password",
//     },
//   ],
//   address: [
//     {
//       type: "select",
//       name: "country",
//       label: "Country",
//       placeholder: "Select country",
//       options: [
//         { label: "India", value: "IN" },
//         { label: "United States", value: "US" },
//       ],
//     },
//     {
//       type: "select",
//       name: "state",
//       label: "State",
//       placeholder: "Select state",
//       options: [
//         { label: "Delhi", value: "DL" },
//         { label: "California", value: "CA" },
//       ],
//     },
//     { type: "text", name: "city", label: "City", placeholder: "Enter city" },
//     {
//       type: "text",
//       name: "addressLine1",
//       label: "Line 1",
//       placeholder: "Enter address line 1",
//     },
//     {
//       type: "text",
//       name: "addressLine2",
//       label: "Line 2",
//       placeholder: "Enter address line 2",
//     },
//     {
//       type: "text",
//       name: "postalCode",
//       label: "Postal Code",
//       placeholder: "Enter postal code",
//     },
//   ],
//   legal_documents: [
//     {
//       type: "file",
//       name: "certificate_of_incorporation",
//       label: "Certificate of Incorporation",
//     },
//     {
//       type: "file",
//       name: "business_license",
//       label: "Business License",
//     },
//     {
//       type: "file",
//       name: "letter_of_authorization",
//       label: "Letter of authorization",
//     },
//   ],
// };
