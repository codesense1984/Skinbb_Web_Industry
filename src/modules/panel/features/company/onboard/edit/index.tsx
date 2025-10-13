import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { MODE } from "@/core/types";
import OnboardForm from "../../components/onboard/onboard-form";
import { apiGetCompanyDetailData } from "@/modules/panel/services/http/company.service";
import { apiGetCompanyLocationDetail } from "@/modules/panel/services/http/company-location.service";
import { useAuth } from "@/modules/auth/hooks/useAuth";

/**
 * OnboardEdit Component
 *
 * This component handles editing company onboarding data.
 * Route: /onboard/company/{id}/edit
 *
 * It fetches company details using apiGetCompanyDetailData and passes
 * the data to the OnboardForm component in edit mode.
 */
const OnboardEdit = () => {
  const { id, locationId } = useParams<{ id: string; locationId: string }>();
  const { userId } = useAuth();

  // Fetch company data for editing
  const {
    data: companyData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [PANEL_ROUTES.ONBOARD.COMPANY_EDIT(id!, locationId!)],
    queryFn: () => apiGetCompanyLocationDetail(id!, locationId!, userId!),
    enabled: !!id && !!locationId && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
            Failed to load company details
          </p>
          <p className="mt-1 text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!companyData?.company) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">No company data found</p>
        </div>
      </div>
    );
  }

  return <OnboardForm mode={MODE.EDIT} initialData={companyData.company} isLocationEdit={true} />;
};

export default OnboardEdit;
