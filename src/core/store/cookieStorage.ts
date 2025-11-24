export type CookieOptions = {
  expires?: number | Date; // number = days, Date = exact expiration
  path?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
};

const cookieStorage = {
  getAsyncItem: async (key: string): Promise<string | null> => {
    const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  },
  getItem: (key: string): string | null => {
    const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  },

  setItem: async (
    key: string,
    value: string,
    opts: CookieOptions = {},
  ): Promise<void> => {
    const encodedValue = encodeURIComponent(value);
    let cookieStr = `${key}=${encodedValue}`;

    if (opts.expires) {
      let expires: Date;
      if (typeof opts.expires === "number") {
        expires = new Date();
        expires.setDate(expires.getDate() + opts.expires);
      } else {
        expires = opts.expires;
      }
      cookieStr += `;expires=${expires.toUTCString()}`;
    }

    cookieStr += `;path=${opts.path ?? "/"}`;
    if (opts.secure) cookieStr += ";secure";
    if (opts.sameSite) cookieStr += `;SameSite=${opts.sameSite}`;

    // Check total cookie size including attributes
    const totalSize = cookieStr.length;

    console.log("🚀 ~ cookieStorage.setItem ~ totalSize:", key, totalSize);
    if (totalSize > 4096) {
      throw new Error(
        `Cookie "${key}" exceeds browser size limit (${totalSize} bytes > 4096 bytes). Consider using localStorage for large values.`,
      );
    }

    // Set the cookie
    document.cookie = cookieStr;

    // Wait a bit for the cookie to be set (browser might need a moment)
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Verify the cookie was actually set
    const saved = cookieStorage.getItem(key);

    // Also check document.cookie directly
    const allCookies = document.cookie;
    const cookieExists = allCookies.includes(key + "=");

    if (!cookieExists) {
      throw new Error(
        `Cookie "${key}" was not found in document.cookie after setting. Cookie may be blocked by browser or domain/path mismatch.`,
      );
    }

    if (saved !== value) {
      throw new Error(
        `Failed to save cookie "${key}". Value mismatch. Expected: ${value.substring(0, 50)}..., Got: ${saved?.substring(0, 50) || "null"}...`,
      );
    }
  },

  removeItem: async (key: string): Promise<void> => {
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;secure;SameSite=Strict`;
  },
};

export default cookieStorage;
