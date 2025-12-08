import { useState, useRef } from "react";
import { PageContent } from "@/core/components/ui/structure";
import { PromotionForm as SharedPromotionForm } from "@/modules/panel/features/promotions/shared/promotion-form";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiGetPromotionById } from "@/modules/panel/services/http/promotion.service";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { FullLoader } from "@/core/components/ui/loader";
import { Button } from "@/core/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NavLink } from "react-router";
import { SELLER_ROUTES } from "../../routes/constant";
import { SubscriptionGuard } from "../../components/subscription";
import { CreditDeductionModal } from "../../components/subscription/CreditDeductionModal";
import { useFeatureAccess } from "../../hooks/useFeatureAccess";
import { useSubscription } from "../../hooks/useSubscription";
import { PromotionFormWithCreditInterceptor } from "./PromotionFormWithCreditInterceptor";

const PromotionForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { creditCost, creditsRemaining, hasAccess, canAfford } = useFeatureAccess("promotion", "create");
  const { isActive, subscription, invalidate } = useSubscription();
  const [showCreditModal, setShowCreditModal] = useState(false);
  const formSubmitRef = useRef<(() => void) | null>(null);

  // Fetch promotion data if editing
  const { data, isLoading, error } = useQuery({
    queryKey: [ENDPOINTS.PROMOTION.GET_BY_ID(id!)],
    queryFn: () => apiGetPromotionById(id!),
    enabled: !!id,
  });

  if (isEdit && isLoading) {
    return <FullLoader />;
  }

  if (isEdit && (error || !data?.data)) {
    return (
      <PageContent
        header={{
          title: isEdit ? "Edit Promotion" : "Create Promotion",
          description: isEdit
            ? "Update promotion details"
            : "Set up a new promotional campaign for your products",
        }}
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error
            ? "Failed to load promotion. Please try again."
            : "Promotion not found."}
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      ariaLabel="promotion-form"
      header={{
        title: isEdit ? "Edit Promotion" : "Create Promotion",
        description: isEdit
          ? "Update promotion details"
          : "Set up a new promotional campaign for your products",
        hasBack: true,
        animate: true,
        actions: (
          <div className="flex gap-2">
            <Button variant="outlined" asChild>
              <NavLink to={SELLER_ROUTES.MARKETING.PROMOTIONS.LIST}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Promotions
              </NavLink>
            </Button>
          </div>
        ),
      }}
    >
      {!isEdit ? (
        <>
          <CreditDeductionModal
            isOpen={showCreditModal}
            onClose={() => {
              setShowCreditModal(false);
              formSubmitRef.current = null;
            }}
            onConfirm={() => {
              setShowCreditModal(false);
              invalidate();
              // Execute the pending submit
              if (formSubmitRef.current) {
                formSubmitRef.current();
                formSubmitRef.current = null;
              }
            }}
            creditCost={creditCost}
            creditsRemaining={creditsRemaining}
            featureName="promotion - create"
          />
          <SubscriptionGuard page="promotion" action="create">
            <PromotionFormWithCreditInterceptor
              creditCost={creditCost}
              creditsRemaining={creditsRemaining}
              hasAccess={hasAccess}
              canAfford={canAfford}
              isActive={isActive}
              subscription={subscription}
              onShowModal={() => setShowCreditModal(true)}
              onSetSubmitRef={(submitFn) => {
                formSubmitRef.current = submitFn;
              }}
            >
              <SharedPromotionForm
                initialData={undefined}
                isEdit={false}
                isView={false}
                listRoute={SELLER_ROUTES.MARKETING.PROMOTIONS.LIST}
              />
            </PromotionFormWithCreditInterceptor>
          </SubscriptionGuard>
        </>
      ) : (
        <SharedPromotionForm
          initialData={data?.data}
          isEdit={true}
          isView={false}
          listRoute={SELLER_ROUTES.MARKETING.PROMOTIONS.LIST}
        />
      )}
    </PageContent>
  );
};

export default PromotionForm;
