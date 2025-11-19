import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { BrandList as CommonBrandList } from "@/modules/panel/components/pages/brands/brand-list";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { NavLink, useSearchParams } from "react-router";

const BrandList = () => {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  const locationId = searchParams.get("locationId");

  const navigateAddBrand = () => {
    let url = PANEL_ROUTES.BRAND.CREATE;
    if (companyId) {
      url += `?companyId=${companyId}`;
    }
    if (locationId) {
      url += `&locationId=${locationId}`;
    }
    return url;
  };
  return (
    <PageContent
      header={{
        title: "Brands",
        description: "Discover top brands from around the world.",
        actions: (
          <Button color="primary" asChild>
            <NavLink to={navigateAddBrand()}>Add Brand</NavLink>
          </Button>
        ),
      }}
    >
      <CommonBrandList
        showCompanyFilter={!companyId}
        showLocationFilter={!locationId}
        showStatusFilter
        companyId={companyId || undefined}
        locationId={locationId || undefined}
      />
    </PageContent>
  );
};

export default BrandList;
