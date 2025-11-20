import { Button } from "@/core/components/ui/button";
import {
  DropdownMenu,
  type DropdownMenuItemType,
} from "@/core/components/ui/dropdown-menu";
import { PageContent } from "@/core/components/ui/structure";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";
import { BrandList as CommonBrandList } from "@/modules/panel/components/pages/brands/brand-list";
import { BrandCard } from "@/modules/panel/components/pages/brands/brand-list/BrandCard";
import {
  createBrandColumns,
  getBrandStatus,
} from "@/modules/panel/components/pages/brands/brand-list/brandColumns";
import type {
  Brand,
  CompanyLocationBrand,
} from "@/modules/panel/types/brand.type";
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { useMemo } from "react";
import { NavLink } from "react-router";
import { SELLER_ROUTES } from "../../routes/constant";
import { STATUS_MAP } from "@/core/config/status";

const BrandList = () => {
  const { sellerInfo } = useSellerAuth();
  const companyId = sellerInfo?.companyId;

  const navigateAddBrand = () => {
    let url = SELLER_ROUTES.BRAND.CREATE;
    return url;
  };

  const columns = useMemo(() => {
    let columns1 = createBrandColumns(companyId || undefined, undefined).filter(
      (column) => {
        const accessorKey =
          "accessorKey" in column ? column.accessorKey : undefined;
        return typeof accessorKey === "string"
          ? !accessorKey.includes("actions")
          : true;
      },
    );

    columns1.push({
      header: "Action",
      accessorKey: "actions",
      enableSorting: false,
      enableHiding: false,
      size: 80,
      cell: ({ row }) => {
        // const companyId = row.original?.companyId;
        // const locationId = row.original?.locationId ?? "";
        // const status = getBrandStatus(row.original);
        const brandId = row.original._id;
        const viewUrl = SELLER_ROUTES.BRAND.VIEW(brandId);
        const editUrl = SELLER_ROUTES.BRAND.EDIT(brandId);

        const items: DropdownMenuItemType[] = [
          {
            type: "link",
            to: viewUrl,
            title: "View brand details",
            children: (
              <>
                <EyeIcon className="size-4" /> View
              </>
            ),
          },
        ];

        //   const isApprovedBrand =
        //   companyId &&
        //   locationId &&
        //   ![
        //     STATUS_MAP.brand.pending.value,
        //     STATUS_MAP.brand.rejected.value,
        //   ].includes(status);

        // if (isApprovedBrand) {
        //   items.push({
        //     type: "link",
        //     to: SELLER_ROUTES.COMPANY_LOCATION_PRODUCTS(
        //       companyId,
        //       locationId,
        //     ),
        //     title: "View products for this brand",
        //     children: (
        //       <>
        //         <ShoppingBagIcon className="size-4" /> View Products
        //       </>
        //     ),
        //   });
        // }

        // const isApprovedBrand = ![
        //   STATUS_MAP.brand.pending.value,
        //   STATUS_MAP.brand.rejected.value,
        // ].includes(status);

        // if (isApprovedBrand) {
        //   items.push({
        //     type: "link",
        //     to: SELLER_ROUTES.COMPANY_LOCATION_PRODUCTS.VIEW(
        //       companyId,
        //       locationId,
        //       brandId,
        //     ),
        //     title: "View products for this brand",
        //     children: (
        //       <>
        //         <ShoppingBagIcon className="size-4" /> View Products
        //       </>
        //     ),
        //   });
        // }

        items.push({
          type: "link",
          to: editUrl,
          title: "Edit brand",
          children: (
            <>
              <PencilIcon className="size-4" /> Edit
            </>
          ),
        });

        return (
          <DropdownMenu items={items}>
            <Button variant="outlined" size="icon">
              <EllipsisVerticalIcon className="size-4" />
            </Button>
          </DropdownMenu>
        );
      },
    });
    return columns1;
  }, [companyId]);

  const renderCard = useMemo(
    () => (brand: Brand | CompanyLocationBrand, _index?: number) => (
      <NavLink to={SELLER_ROUTES.BRAND.VIEW(brand._id)}>
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
        showLocationFilter={true}
        showStatusFilter
        companyId={companyId || undefined}
        columns={columns}
        renderCard={renderCard}
      />
    </PageContent>
  );
};

export default BrandList;
