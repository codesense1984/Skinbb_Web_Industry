/**
 * Generic utility functions for FormData operations
 */

/**
 * Converts any data object to FormData with proper array handling
 * @param data - The data object to convert (files will be merged into this)
 * @param arrayKeys - Array of keys that should be treated as arrays with indexing
 * @returns FormData object
 */
export function createFormData(
  data: Record<string, unknown>,
  arrayKeys: string[] = ["addresses", "sellingOn"],
): FormData {
  const formData = new FormData();

  // Add all fields including files
  Object.entries(data).forEach(([key, value]) => {
    // Allow empty strings for required fields, but skip null/undefined
    if (value !== null && value !== undefined) {
      if (arrayKeys.includes(key) && Array.isArray(value)) {
        // Handle specified arrays with proper indexing
        value.forEach((item, index) => {
          Object.entries(item).forEach(([itemKey, itemValue]) => {
            if (itemValue !== null && itemValue !== undefined) {
              if (itemValue instanceof File) {
                // Handle files in arrays
                formData.append(`${key}[${index}][${itemKey}]`, itemValue);
              } else {
                formData.append(
                  `${key}[${index}][${itemKey}]`,
                  String(itemValue),
                );
              }
            }
          });
        });
      } else if (value instanceof File) {
        // Handle single files
        formData.append(key, value);
      } else if (
        Array.isArray(value) &&
        value.length > 0 &&
        value[0] instanceof File
      ) {
        // Handle file arrays - append first file without index
        formData.append(key, value[0]);
      } else if (typeof value === "object" && !Array.isArray(value)) {
        // Check if object contains files
        const hasFiles = Object.values(value).some((v) => v instanceof File);
        if (hasFiles) {
          // Handle object with files - append first file
          const firstFile = Object.values(value).find((v) => v instanceof File);
          if (firstFile) {
            formData.append(key, firstFile as File);
          }
        } else {
          // Handle other nested objects by stringifying them
          formData.append(key, JSON.stringify(value));
        }
      } else if (Array.isArray(value)) {
        // Handle simple arrays (like productCategory) - append each item with index
        if (value.length > 0) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, String(item));
          });
        }
      } else {
        // Handle primitive values (numbers and strings)
        // Convert numbers to strings for FormData
        if (typeof value === "number") {
          formData.append(key, String(value));
        } else {
          formData.append(key, String(value));
        }
      }
    }
  });

  return formData;
}

/**
 * Converts FormData to a plain object for debugging/logging
 * @param formData - The FormData object to convert
 * @returns Plain object representation
 */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      obj[key] = {
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: value.lastModified,
      };
    } else {
      obj[key] = value;
    }
  }

  return obj;
}

/**
 * Appends a file to FormData with optional custom key
 * @param formData - The FormData object
 * @param file - The file to append
 * @param key - The key to use (defaults to file name)
 */
export function appendFile(formData: FormData, file: File, key?: string): void {
  formData.append(key || file.name, file);
}

/**
 * Appends multiple files to FormData with array indexing
 * @param formData - The FormData object
 * @param files - Array of files to append
 * @param key - The base key to use
 */
export function appendFiles(
  formData: FormData,
  files: File[],
  key: string,
): void {
  files.forEach((file, index) => {
    formData.append(`${key}[${index}]`, file);
  });
}
