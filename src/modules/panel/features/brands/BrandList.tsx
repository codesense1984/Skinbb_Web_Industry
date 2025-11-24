import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { BrandList as CommonBrandList } from "@/modules/panel/components/shared/brands/brand-list";
import { BrandCard } from "@/modules/panel/components/shared/brands/brand-list/BrandCard";
import { createBrandColumns } from "@/modules/panel/components/shared/brands/brand-list/brandColumns";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type {
  Brand,
  CompanyLocationBrand,
} from "@/modules/panel/types/brand.type";
import { useMemo } from "react";
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

  const columns = useMemo(
    () => createBrandColumns(companyId || undefined, locationId || undefined),
    [companyId, locationId],
  );

  const renderCard = useMemo(
    () => (brand: Brand | CompanyLocationBrand, _index?: number) => (
      <NavLink to={PANEL_ROUTES.BRAND.VIEW(brand._id)}>
        <BrandCard brand={brand} />
      </NavLink>
    ),
    [],
  );

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
        columns={columns}
        renderCard={renderCard}
      />
    </PageContent>
  );
};

export default BrandList;
