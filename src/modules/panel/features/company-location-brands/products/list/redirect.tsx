import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

/**
 * Redirect component for brand products list
 * Redirects to unified product list with companyId, locationId, and brandId filters
 */
const BrandProductsRedirect = () => {
  const { companyId, locationId, brandId } = useParams<{
    companyId: string;
    locationId: string;
    brandId: string;
  }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (companyId && locationId && brandId) {
      navigate(
        `${PANEL_ROUTES.LISTING.LIST}?companyId=${companyId}&locationId=${locationId}&brandId=${brandId}`,
        { replace: true },
      );
    } else {
      // If params are missing, just go to listing page
      navigate(PANEL_ROUTES.LISTING.LIST, { replace: true });
    }
  }, [companyId, locationId, brandId, navigate]);

  return null;
};

export default BrandProductsRedirect;
