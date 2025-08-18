// src/context/cookieStorage.ts
const cookieStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    console.log("🚀 ~ setItem: ~ value:", value);
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7 days
    document.cookie = `${key}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;secure;SameSite=Strict`;
  },

  removeItem: async (key: string): Promise<void> => {
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;secure;SameSite=Strict`;
  },
};

export default cookieStorage;
