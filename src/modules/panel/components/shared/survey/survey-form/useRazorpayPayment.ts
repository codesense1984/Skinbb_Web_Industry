import { useCallback, useEffect, useState } from "react";
import type { VerifyPaymentRequest } from "@/modules/panel/types/survey.types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number; // Amount in paise
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface UseRazorpayPaymentReturn {
  isRazorpayLoaded: boolean;
  openRazorpayCheckout: (options: Omit<RazorpayOptions, "handler">) => Promise<{
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }>;
  isLoading: boolean;
}

/**
 * Hook to handle Razorpay payment integration
 * Loads Razorpay script and provides checkout functionality
 */
export function useRazorpayPayment(): UseRazorpayPaymentReturn {
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      setIsRazorpayLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        setIsRazorpayLoaded(true);
      });
      return;
    }

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setIsRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      const scriptElement = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, []);

  const openRazorpayCheckout = useCallback(
    (
      options: Omit<RazorpayOptions, "handler">,
    ): Promise<{
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }> => {
      return new Promise((resolve, reject) => {
        if (!window.Razorpay) {
          reject(new Error("Razorpay script not loaded"));
          return;
        }

        setIsLoading(true);

        const razorpayOptions: RazorpayOptions = {
          ...options,
          handler: (response) => {
            setIsLoading(false);
            resolve({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
              reject(new Error("Payment cancelled by user"));
            },
          },
        };

        try {
          const razorpay = new window.Razorpay(razorpayOptions);
          razorpay.open();
        } catch (error) {
          setIsLoading(false);
          reject(error);
        }
      });
    },
    [],
  );

  return {
    isRazorpayLoaded,
    openRazorpayCheckout,
    isLoading,
  };
}
