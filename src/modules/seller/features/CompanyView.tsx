import React from "react";
import { CompanyViewCore } from "@/modules/panel/features/company/components/CompanyViewCore";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";

interface SellerCompanyViewProps {
  showViewUsersAction?: boolean;
  customHeader?: {
    title?: string;
    description?: string;
    actions?: React.ReactNode;
  };
  onViewBrands?: (companyId: string, locationId: string) => void;
  onViewUsers?: (companyId: string) => void;
}

const SellerCompanyView: React.FC<SellerCompanyViewProps> = ({
  showViewUsersAction = false,
  customHeader,
  onViewBrands,
  onViewUsers,
}) => {
  const { sellerInfo, isLoading, isError, getCompanyId } = useSellerAuth();

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

  if (!companyId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">Company ID not found in seller information</p>
        </div>
      </div>
    );
  }

  return (
    <CompanyViewCore
      companyId={companyId}
      showViewUsersAction={showViewUsersAction}
      customHeader={customHeader}
      onViewBrands={onViewBrands}
      onViewUsers={onViewUsers}
    />
  );
};

export default SellerCompanyView;
