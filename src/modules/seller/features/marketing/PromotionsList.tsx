import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { Plus } from "lucide-react";
import { NavLink } from "react-router";
import { SELLER_ROUTES } from "../../routes/constant";

const PromotionsList = () => {
  return (
    <PageContent
      ariaLabel="promotions"
      header={{
        title: "Promotions",
        description: "Create and manage promotional campaigns for your products",
        hasBack: false,
        animate: true,
        actions: (
          <Button asChild>
            <NavLink to={SELLER_ROUTES.MARKETING.PROMOTIONS.CREATE}>
              <Plus className="mr-2 h-4 w-4" />
              Create Promotion
            </NavLink>
          </Button>
        ),
      }}
    >
      <div className="space-y-4">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No promotions yet
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first promotional campaign to boost product visibility
          </p>
          <Button asChild>
            <NavLink to={SELLER_ROUTES.MARKETING.PROMOTIONS.CREATE}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Promotion
            </NavLink>
          </Button>
        </div>
      </div>
    </PageContent>
  );
};

export default PromotionsList;
