import { useNavigate } from "react-router";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { DataTable } from "@/core/components/data-table";
import { columns } from "../data";
import { fetcher } from "../fetcher";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function DiscountCouponList() {
  const navigate = useNavigate();
  
  // Handle form actions
  const handleAddCoupon = () => {
    navigate(PANEL_ROUTES.MASTER.DISCOUNT_COUPON_CREATE);
  };
  
  const handleViewCoupon = (id: string) => {
    navigate(PANEL_ROUTES.MASTER.DISCOUNT_COUPON_VIEW(id));
  };
  
  const handleEditCoupon = (id: string) => {
    navigate(PANEL_ROUTES.MASTER.DISCOUNT_COUPON_EDIT(id));
  };

  const handleDeleteCoupon = (id: string) => {
    // TODO: Implement delete functionality with confirmation dialog
    console.log("Delete coupon:", id);
  };

  return (
    <PageContent
      header={{
        title: "Discount Coupons",
        description: "Manage discount coupons and promotional codes",
        actions: (
          <Button
            onClick={handleAddCoupon}
            variant="contained"
            color="secondary"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Coupon
          </Button>
        ),
      }}
    >
      <div className="w-full">
        <DataTable
          columns={columns()}
          isServerSide
          fetcher={fetcher()}
          queryKeyPrefix={PANEL_ROUTES.MASTER.DISCOUNT_COUPON}
          meta={{
            onView: handleViewCoupon,
            onEdit: handleEditCoupon,
            onDelete: handleDeleteCoupon,
          }}
        />
      </div>
    </PageContent>
  );
}
