import { useState, useRef, type ReactNode } from "react";
import { useFeatureAccess } from "../../hooks/useFeatureAccess";
import { useSubscription } from "../../hooks/useSubscription";
import { CreditDeductionModal } from "./CreditDeductionModal";

interface PromotionFormWithCreditCheckProps {
  children: ReactNode;
  onFormSubmit: (originalSubmit: () => void) => void;
}

/**
 * Wrapper component that intercepts form submission and shows credit deduction modal
 * for promotion creation
 */
export function PromotionFormWithCreditCheck({
  children,
  onFormSubmit,
}: PromotionFormWithCreditCheckProps) {
  const { hasAccess, creditCost, loading, canAfford, creditsRemaining } =
    useFeatureAccess("promotion", "create");
  const { isActive, subscription, invalidate } = useSubscription();
  const [showCreditModal, setShowCreditModal] = useState(false);
  const pendingSubmitRef = useRef<(() => void) | null>(null);

  // If no subscription or no access, just render children (SubscriptionGuard will handle it)
  if (!isActive || !subscription || !hasAccess || !canAfford || creditCost === 0) {
    return <>{children}</>;
  }

  const handleFormSubmit = (originalSubmit: () => void) => {
    // If credits are required, show modal first
    if (creditCost > 0) {
      pendingSubmitRef.current = originalSubmit;
      setShowCreditModal(true);
    } else {
      // No credits required, proceed directly
      originalSubmit();
    }
  };

  const handleConfirm = () => {
    setShowCreditModal(false);
    // Invalidate subscription to refresh credits
    invalidate();
    // Execute the pending submit
    if (pendingSubmitRef.current) {
      pendingSubmitRef.current();
      pendingSubmitRef.current = null;
    }
  };

  const handleCancel = () => {
    setShowCreditModal(false);
    pendingSubmitRef.current = null;
  };

  return (
    <>
      <CreditDeductionModal
        isOpen={showCreditModal}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        creditCost={creditCost}
        creditsRemaining={creditsRemaining}
        featureName="promotion - create"
      />
      {onFormSubmit(handleFormSubmit)}
    </>
  );
}

