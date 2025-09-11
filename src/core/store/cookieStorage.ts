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
    let cookieStr = `${key}=${encodeURIComponent(value)}`;

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

    document.cookie = cookieStr;
  },

  removeItem: async (key: string): Promise<void> => {
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;secure;SameSite=Strict`;
  },
};

export default cookieStorage;
