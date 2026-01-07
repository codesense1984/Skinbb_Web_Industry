const localStorage = {
  getItem<T = string>(key: string): T | null {
    const value = window.localStorage.getItem(key);
    if (!value) return null;

    if (typeof value == "string") {
      return value as unknown as T;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      // fallback: return raw string if not JSON
      return value as unknown as T;
    }
  },

  setItem: async (key: string, value: string | object): Promise<void> => {
    try {
      const serialized =
        typeof value === "string" ? value : JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
    } catch (err) {
      console.error(`Error saving "${key}" to localStorage`, err);
    }
  },

  removeItem: (key: string): void => {
    window.localStorage.removeItem(key);
  },
};

export default localStorage;
