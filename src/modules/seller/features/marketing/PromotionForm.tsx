import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NavLink } from "react-router";
import { SELLER_ROUTES } from "../../routes/constant";

const PromotionForm = () => {
  return (
    <PageContent
      ariaLabel="promotion-form"
      header={{
        title: "Create Promotion",
        description: "Set up a new promotional campaign for your products",
        hasBack: true,
        animate: true,
        actions: (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <NavLink to={SELLER_ROUTES.MARKETING.PROMOTIONS.LIST}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Promotions
              </NavLink>
            </Button>
            <Button>Save Promotion</Button>
          </div>
        ),
      }}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Promotion Builder Coming Soon
          </h3>
          <p className="text-sm text-muted-foreground">
            This form will allow you to create and manage promotional campaigns
          </p>
        </div>
      </div>
    </PageContent>
  );
};

export default PromotionForm;
