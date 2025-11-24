import { useCallback } from "react";

interface RazorpayOptions {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  name: string;
  description: string;
  onSuccess: (paymentResponse: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onError: (error: Error) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useRazorpayPayment() {
  const loadRazorpayScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay script"));
      document.body.appendChild(script);
    });
  }, []);

  const openRazorpayCheckout = useCallback(
    async (options: RazorpayOptions) => {
      try {
        await loadRazorpayScript();

        if (!window.Razorpay) {
          throw new Error("Razorpay SDK not loaded");
        }

        const razorpayOptions = {
          key: options.key,
          amount: options.amount,
          currency: options.currency,
          name: options.name,
          description: options.description,
          order_id: options.orderId,
          handler: function (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) {
            options.onSuccess(response);
          },
          prefill: {
            // You can prefill customer details if available
            // name: "",
            // email: "",
            // contact: "",
          },
          theme: {
            color: "#6366f1",
          },
          modal: {
            ondismiss: function () {
              options.onError(new Error("Payment cancelled by user"));
            },
          },
        };

        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.open();
      } catch (error) {
        options.onError(
          error instanceof Error ? error : new Error("Failed to open payment"),
        );
      }
    },
    [loadRazorpayScript],
  );

  return { openRazorpayCheckout };
}




