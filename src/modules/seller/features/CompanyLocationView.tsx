import React from "react";
import { CompanyLocationViewCore } from "@/modules/panel/features/company-location/components/CompanyLocationViewCore";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";

interface SellerCompanyLocationViewProps {
  locationId?: string;
  showApprovalActions?: boolean;
  customHeader?: {
    title?: string;
    description?: string;
    actions?: React.ReactNode;
  };
}

 const SellerCompanyLocationView: React.FC<SellerCompanyLocationViewProps> = ({
  locationId,
  showApprovalActions = false,
  customHeader,
}) => {
  const { sellerInfo, isLoading, isError, getCompanyId, getPrimaryAddress } = useSellerAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">Loading seller information...</p>
        </div>
      </div>
    );
  }

  if (isError || !sellerInfo) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 p-3">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="font-medium text-red-600">
            Failed to load seller information
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Please try refreshing the page or contact support.
          </p>
        </div>
      </div>
    );
  }

  const companyId = getCompanyId();
  const primaryAddress = getPrimaryAddress();
  
  // Use provided locationId or fall back to primary address
  const targetLocationId = locationId || primaryAddress?.addressId;

  if (!companyId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">Company ID not found in seller information</p>
        </div>
      </div>
    );
  }

  if (!targetLocationId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">Location ID not found</p>
        </div>
      </div>
    );
  }

  return (
    <CompanyLocationViewCore
      companyId={companyId}
      locationId={targetLocationId}
      showApprovalActions={showApprovalActions}
      customHeader={customHeader}
    />
  );
};

export default SellerCompanyLocationView;