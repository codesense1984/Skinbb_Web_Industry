import { useMemo } from "react";
import { useSubscription } from "./useSubscription";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { Subscription } from "../types/subscription.types";

interface UseFeatureAccessResult {
  hasAccess: boolean;
  creditCost: number;
  loading: boolean;
  subscription: Subscription | null;
  canAfford: boolean;
  creditsRemaining: number;
  isModuleAccess: boolean;
}

export function useFeatureAccess(
  page: string,
  action: string,
): UseFeatureAccessResult {
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { user } = useAuth();

  const result = useMemo(() => {
    if (subscriptionLoading) {
      return {
        hasAccess: false,
        creditCost: 0,
        loading: true,
        subscription: null,
        canAfford: false,
        creditsRemaining: 0,
        isModuleAccess: false,
      };
    }

    if (!subscription) {
      return {
        hasAccess: false,
        creditCost: 0,
        loading: false,
        subscription: null,
        canAfford: false,
        creditsRemaining: 0,
        isModuleAccess: false,
      };
    }

    // Handle case where planId might be a string
    const planId =
      typeof subscription.planId === "string"
        ? null
        : subscription.planId;

    if (!planId) {
      console.warn("[useFeatureAccess] planId is string or null:", subscription.planId);
      return {
        hasAccess: false,
        creditCost: 0,
        loading: false,
        subscription,
        canAfford: false,
        creditsRemaining: subscription.totalCreditsRemaining,
        isModuleAccess: false,
      };
    }

    // Debug: Log subscription and plan data
    console.log("[useFeatureAccess] Checking access for:", { page, action });
    console.log("[useFeatureAccess] Subscription:", subscription);
    console.log("[useFeatureAccess] Plan:", planId);
    console.log("[useFeatureAccess] Plan modules:", planId.modules);
    console.log("[useFeatureAccess] Plan features:", planId.features);
    console.log("[useFeatureAccess] Plan roleAccess:", planId.roleAccess);
    console.log("[useFeatureAccess] User roleValue:", user?.roleValue);

    // Check module access (module-based subscription)
    // First check direct plan modules
    let hasModuleAccess = planId.modules?.some(
      (m) => m.page === page && m.isEnabled,
    );

    // Also check roleAccess modules if available
    // If roleAccess exists, we should ideally match by roleId, but for now check all
    if (!hasModuleAccess && planId.roleAccess && planId.roleAccess.length > 0) {
      console.log("[useFeatureAccess] Checking roleAccess modules");
      hasModuleAccess = planId.roleAccess.some((roleAccess) => {
        const hasAccess = roleAccess.modules?.some((m) => m.page === page && m.isEnabled);
        if (hasAccess) {
          console.log("[useFeatureAccess] Found module access in roleAccess:", roleAccess.roleId);
        }
        return hasAccess;
      });
    }

    if (hasModuleAccess) {
      return {
        hasAccess: true,
        creditCost: 0, // Module-based = no credit cost
        loading: false,
        subscription,
        canAfford: true,
        creditsRemaining: subscription.totalCreditsRemaining,
        isModuleAccess: true,
      };
    }

    // Check feature access (feature-based subscription)
    // First check direct plan features
    let feature = planId.features?.find(
      (f) => f.page === page && f.action === action && f.isEnabled,
    );

    // Also check roleAccess features if not found in direct features
    if (!feature && planId.roleAccess && planId.roleAccess.length > 0) {
      console.log("[useFeatureAccess] Checking roleAccess features");
      for (const roleAccess of planId.roleAccess) {
        const roleFeature = roleAccess.features?.find(
          (f) => f.page === page && f.action === action && f.isEnabled,
        );
        if (roleFeature) {
          console.log("[useFeatureAccess] Found feature access in roleAccess:", roleAccess.roleId, roleFeature);
          feature = roleFeature;
          break;
        }
      }
    }

    console.log("[useFeatureAccess] Final feature:", feature);

    if (feature) {
      const totalCredits = subscription.totalCreditsRemaining;
      const cost = feature.creditCost || 0;

      // Check if feature uses credit-based expiration
      if (feature.expiresOnCreditsExhausted) {
        // For credit-based expiration, check if credits are exhausted
        return {
          hasAccess: totalCredits > 0,
          creditCost: cost,
          loading: false,
          subscription,
          canAfford: totalCredits >= cost,
          creditsRemaining: totalCredits,
          isModuleAccess: false,
        };
      } else {
        // For time-based expiration, check subscription status
        return {
          hasAccess: subscription.status === "active",
          creditCost: cost,
          loading: false,
          subscription,
          canAfford: totalCredits >= cost,
          creditsRemaining: totalCredits,
          isModuleAccess: false,
        };
      }
    }

    // No access
    return {
      hasAccess: false,
      creditCost: 0,
      loading: false,
      subscription,
      canAfford: false,
      creditsRemaining: subscription.totalCreditsRemaining,
      isModuleAccess: false,
    };
  }, [subscription, subscriptionLoading, page, action, user]);

  return result;
}

