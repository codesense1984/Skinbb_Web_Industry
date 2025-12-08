import { useState, useEffect, type ReactNode } from "react";
import { useFeatureAccess } from "../../hooks/useFeatureAccess";
import { useSubscription } from "../../hooks/useSubscription";
import { UpgradeModal } from "./UpgradeModal";
import { CreditDeductionModal } from "./CreditDeductionModal";
import { FullLoader } from "@/core/components/ui/loader";

interface SubscriptionGuardProps {
  page: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
  onCreditDeducted?: () => void;
  showCreditModalOnLoad?: boolean; // For features that require credit confirmation on page load
}

export function SubscriptionGuard({
  page,
  action,
  children,
  fallback,
  onCreditDeducted,
  showCreditModalOnLoad = false,
}: SubscriptionGuardProps) {
  const { hasAccess, creditCost, loading, canAfford, creditsRemaining } =
    useFeatureAccess(page, action);
  const { isActive, subscription: currentSubscription, invalidate } = useSubscription();
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditConfirmed, setCreditConfirmed] = useState(false);

  // Show credit modal on load if enabled and credits are required
  useEffect(() => {
    if (
      showCreditModalOnLoad &&
      isActive &&
      currentSubscription &&
      hasAccess &&
      canAfford &&
      creditCost > 0 &&
      !creditConfirmed &&
      !showCreditModal
    ) {
      setShowCreditModal(true);
    }
  }, [
    showCreditModalOnLoad,
    isActive,
    currentSubscription,
    hasAccess,
    canAfford,
    creditCost,
    creditConfirmed,
    showCreditModal,
  ]);

  if (loading) {
    return <FullLoader />;
  }

  // If user has active subscription, don't show upgrade modal
  // Just check feature access and credits
  if (isActive && currentSubscription) {
    // If has access and can afford, show credit modal if cost > 0 and not confirmed yet
    if (hasAccess && canAfford) {
      // Show credit deduction modal if credits are required and not yet confirmed
      if (creditCost > 0 && !creditConfirmed && showCreditModal) {
        return (
          <>
            <CreditDeductionModal
              isOpen={showCreditModal}
              onClose={() => {
                setShowCreditModal(false);
                // Don't allow access if user cancels
              }}
              onConfirm={() => {
                setCreditConfirmed(true);
                setShowCreditModal(false);
                // Invalidate subscription to refresh credits after deduction
                invalidate();
                onCreditDeducted?.();
              }}
              creditCost={creditCost}
              creditsRemaining={creditsRemaining}
              featureName={`${page} - ${action}`}
            />
            {/* Show loading state while waiting for confirmation */}
            <div className="flex min-h-[400px] items-center justify-center">
              <FullLoader />
            </div>
          </>
        );
      }

      // If confirmed or no credit cost, allow access
      if (creditConfirmed || creditCost === 0) {
        return <>{children}</>;
      }
    }

    // If has access but insufficient credits, show credit message (no modal)
    if (hasAccess && !canAfford && creditCost > 0) {
      return (
        fallback || (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
            <h3 className="mb-2 font-semibold text-yellow-800">
              Insufficient Credits
            </h3>
            <p className="text-sm text-yellow-700">
              You need {creditCost} credits but only have {creditsRemaining} credits available.
              Please purchase more credits or upgrade your plan.
            </p>
          </div>
        )
      );
    }

    // If doesn't have access to feature, show message (no modal)
    if (!hasAccess) {
      return (
        fallback || (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
            <h3 className="mb-2 font-semibold text-yellow-800">
              Feature Not Available
            </h3>
            <p className="text-sm text-yellow-700">
              Your current subscription plan does not include access to this feature.
              Please contact support to upgrade your plan.
            </p>
          </div>
        )
      );
    }
  }

  // If no subscription or subscription expired, show upgrade modal
  if (!isActive || !currentSubscription) {
    if (!hasAccess) {
      return (
        fallback || (
          <UpgradeModal
            isOpen={true}
            onClose={() => {}}
            feature={`${page}.${action}`}
            message="You need a subscription to access this feature"
          />
        )
      );
    }

    if (!canAfford && creditCost > 0) {
      return (
        fallback || (
          <UpgradeModal
            isOpen={true}
            onClose={() => {}}
            feature={`${page}.${action}`}
            message={`Insufficient credits. Required: ${creditCost}, Available: ${creditsRemaining}`}
            requiredCredits={creditCost}
            availableCredits={creditsRemaining}
          />
        )
      );
    }
  }

  // Default: allow access
  return <>{children}</>;
}

