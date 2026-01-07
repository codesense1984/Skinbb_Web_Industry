// PAN Verification Request Types
export interface PanVerificationRequest {
  panData: {
    pan: string;
    nameAsPerPan: string;
    dateOfBirth: string;
  };
}

// PAN Verification Response Types
export interface PanVerificationData {
  "@entity": string;
  pan: string;
  status: "valid" | "invalid";
  remarks: string | null;
  name_as_per_pan_match: boolean;
  date_of_birth_match: boolean;
  category: "company" | "individual";
  aadhaar_seeding_status: "na" | "seeded" | "not_seeded";
}

export interface PanVerificationResponse {
  code: number;
  timestamp: number;
  data: PanVerificationData;
  transaction_id: string;
}

// GST Verification Request Types
export interface GstVerificationRequest {
  gstin: string;
}

// GST Verification Response Types
export interface GstAddress {
  bnm: string;
  st: string;
  loc: string;
  bno: string;
  dst: string;
  lt: string;
  locality: string;
  pncd: string;
  landMark: string;
  stcd: string;
  geocodelvl: string;
  flno: string;
  lg: string;
}

export interface GstPrincipalAddress {
  addr: GstAddress;
  ntr: string;
}

export interface GstVerificationData {
  stjCd: string;
  lgnm: string;
  stj: string;
  dty: string;
  adadr: unknown[];
  cxdt: string;
  gstin: string;
  nba: string[];
  lstupdt: string;
  rgdt: string;
  ctb: string;
  pradr: GstPrincipalAddress;
  tradeNam: string;
  sts: string;
  ctjCd: string;
  ctj: string;
  einvoiceStatus: string;
}

export interface GstVerificationInnerData {
  data: GstVerificationData;
  status_cd: string;
}

export interface GstVerificationResponse {
  code: number;
  timestamp: number;
  data: GstVerificationInnerData;
  transaction_id: string;
}

// CIN Verification Request Types
export interface CinVerificationRequest {
  cinData: {
    cin: string;
  };
}

// CIN Verification Response Types
export interface CinCompanyMasterData {
  "@entity": string;
  company_category: string;
  email_id: string;
  class_of_company: string;
  date_of_last_agm: string;
  registered_address: string;
  registration_number: string;
  "paid_up_capital(rs)": string;
  whether_listed_or_not: string;
  suspended_at_stock_exchange: string;
  cin: string;
  company_subcategory: string;
  "authorised_capital(rs)": string;
  "company_status(for_efiling)": string;
  roc_code: string;
  date_of_balance_sheet: string;
  date_of_incorporation: string;
  company_name: string;
  main_division_of_business_activity_to_be_carried_out_in_india: string;
  "previous_firm/_company_details,_if_applicable": string;
  number_of_designated_partners: string;
  total_obligation_of_contribution: string;
  description_of_main_division: string;
  number_of_partners: string;
  rd_region: string;
  balance_sheets: unknown[];
  annual_returns: unknown[];
}

export interface CinDirectorDetails {
  "@entity": string;
  end_date: string;
  "din/pan": string;
  designation: string;
  begin_date: string;
  name: string;
}

export interface CinVerificationData {
  "@entity": string;
  company_master_data: CinCompanyMasterData;
  charges: unknown[];
  "directors/signatory_details": CinDirectorDetails[];
}

export interface CinVerificationResponse {
  code: number;
  timestamp: number;
  data: CinVerificationData;
  transaction_id: string;
}
