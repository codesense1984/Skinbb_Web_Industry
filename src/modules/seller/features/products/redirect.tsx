import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

/**
 * Redirect component for seller products list
 * Redirects to unified product list with seller's companyId filter
 */
const SellerProductsRedirect = () => {
  const { sellerInfo } = useSellerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (sellerInfo?.companyId) {
      navigate(
        `${PANEL_ROUTES.LISTING.LIST}?companyId=${sellerInfo.companyId}`,
        { replace: true },
      );
    } else {
      // If company info is not available, just go to listing page
      navigate(PANEL_ROUTES.LISTING.LIST, { replace: true });
    }
  }, [sellerInfo?.companyId, navigate]);

  return null;
};

export default SellerProductsRedirect;
