import { useEffect, type ReactNode } from "react";
import type { Subscription } from "../../types/subscription.types";

interface PromotionFormWithCreditInterceptorProps {
  children: ReactNode;
  creditCost: number;
  creditsRemaining: number;
  hasAccess: boolean;
  canAfford: boolean;
  isActive: boolean;
  subscription: Subscription | null;
  onShowModal: () => void;
  onSetSubmitRef: (submitFn: () => void) => void;
}

/**
 * Intercepts form submission to show credit deduction modal
 */
export function PromotionFormWithCreditInterceptor({
  children,
  creditCost,
  creditsRemaining,
  hasAccess,
  canAfford,
  isActive,
  subscription,
  onShowModal,
  onSetSubmitRef,
}: PromotionFormWithCreditInterceptorProps) {
  useEffect(() => {
    // Find the form element
    const findForm = () => {
      return document.querySelector('form[class*="space-y-6"]') as HTMLFormElement;
    };

    let form: HTMLFormElement | null = null;
    let interceptedHandler: ((e: Event) => void) | null = null;

    const setupInterceptor = () => {
      form = findForm();
      if (!form) return;

      interceptedHandler = (e: Event) => {
        // If credits are required and user has access, show modal
        if (
          isActive &&
          subscription &&
          hasAccess &&
          canAfford &&
          creditCost > 0
        ) {
          e.preventDefault();
          e.stopPropagation();

          // Store function to proceed with submission
          onSetSubmitRef(() => {
            // Remove interceptor temporarily
            if (form && interceptedHandler) {
              form.removeEventListener("submit", interceptedHandler, true);
            }
            // Submit the form
            if (form) {
              const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
              form.dispatchEvent(submitEvent);
            }
            // Re-add interceptor after a delay
            setTimeout(() => {
              if (form && interceptedHandler) {
                form.addEventListener("submit", interceptedHandler, true);
              }
            }, 100);
          });

          onShowModal();
        }
        // Otherwise, let the default behavior proceed
      };

      // Add interceptor in capture phase (before React Hook Form's handler)
      form.addEventListener("submit", interceptedHandler, true);
    };

    // Wait for form to be available
    const checkForm = setInterval(() => {
      if (findForm()) {
        clearInterval(checkForm);
        setupInterceptor();
      }
    }, 100);

    return () => {
      clearInterval(checkForm);
      if (form && interceptedHandler) {
        form.removeEventListener("submit", interceptedHandler, true);
      }
    };
  }, [creditCost, creditsRemaining, hasAccess, canAfford, isActive, subscription, onShowModal, onSetSubmitRef]);

  return <>{children}</>;
}

