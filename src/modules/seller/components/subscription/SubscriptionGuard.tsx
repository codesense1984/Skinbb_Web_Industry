import { useState, useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router";
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
  const location = useLocation();
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditConfirmed, setCreditConfirmed] = useState(false);
  const lastLocationRef = useRef(location.pathname);

  // Reset credit confirmation when navigating to a new page
  // This ensures the modal shows every time the user accesses the page
  useEffect(() => {
    if (lastLocationRef.current !== location.pathname) {
      lastLocationRef.current = location.pathname;
      setCreditConfirmed(false);
      setShowCreditModal(false);
    }
  }, [location.pathname]);

  // Show credit modal on load if enabled and credits are required
  // Show modal if: user has subscription, feature requires credits, and can afford
  // (hasAccess check removed - we want to show modal even if hasAccess is false, as long as feature exists in plan)
  useEffect(() => {
    if (
      showCreditModalOnLoad &&
      isActive &&
      currentSubscription &&
      creditCost > 0 &&
      canAfford &&
      !creditConfirmed
    ) {
      setShowCreditModal(true);
    }
  }, [
    showCreditModalOnLoad,
    isActive,
    currentSubscription,
    canAfford,
    creditCost,
    creditConfirmed,
  ]);

  if (loading) {
    return <FullLoader />;
  }

  // If user has active subscription, don't show upgrade modal
  // Just check feature access and credits
  if (isActive && currentSubscription) {
    // If feature requires credits (creditCost > 0), feature exists in plan
    // Show credit modal to unlock access (even if hasAccess is currently false)
    if (creditCost > 0) {
      // If can afford, show credit modal to confirm deduction
      if (canAfford) {
        // Show credit deduction modal if not yet confirmed
        // For showCreditModalOnLoad, always show modal on page access
        if (!creditConfirmed || (showCreditModalOnLoad && showCreditModal)) {
          return (
            <>
              <CreditDeductionModal
                isOpen={true}
                onClose={() => {
                  setShowCreditModal(false);
                  // Don't allow access if user cancels - could navigate away or show message
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

        // If confirmed, allow access
        return <>{children}</>;
      }

      // If insufficient credits, show message
      if (!canAfford) {
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
    }

    // If feature has no credit cost and has access, allow access
    if (creditCost === 0 && hasAccess) {
      return <>{children}</>;
    }

    // If feature doesn't exist in plan (creditCost === 0 and hasAccess === false), show not available
    if (creditCost === 0 && !hasAccess) {
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

