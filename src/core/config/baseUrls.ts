export const baseApiUrl = import.meta.env.VITE_API_URL;
export const basePythonApiUrl = import.meta.env.VITE_PYTHON_API_URL;

// Razorpay Configuration
// Only the public key (KEY_ID) should be used on the frontend
// The secret key should NEVER be exposed on the frontend
export const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_WvKqa5QC99HPPl';