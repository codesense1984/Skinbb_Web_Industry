import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

/**
 * Redirect component for company location products list
 * Redirects to unified product list with companyId and locationId filters
 */
const CompanyLocationProductsRedirect = () => {
  const { companyId, locationId } = useParams<{
    companyId: string;
    locationId: string;
  }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (companyId && locationId) {
      navigate(
        `${PANEL_ROUTES.LISTING.LIST}?companyId=${companyId}&locationId=${locationId}`,
        { replace: true }
      );
    } else {
      // If params are missing, just go to listing page
      navigate(PANEL_ROUTES.LISTING.LIST, { replace: true });
    }
  }, [companyId, locationId, navigate]);

  return null;
};

export default CompanyLocationProductsRedirect;

