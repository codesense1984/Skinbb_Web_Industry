/**
 * Convert Date object to dd/mm/yyyy or dd/mm/yyyy hh:mm format
 */
export function formatDateForAPI(date: Date, includeTime = false): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  if (includeTime) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  return `${day}/${month}/${year}`;
}

/**
 * Convert dd/mm/yyyy or dd/mm/yyyy hh:mm string to Date object
 */
export function parseDateFromAPI(dateString: string): Date {
  // Handle ISO format from API
  if (dateString.includes("T")) {
    return new Date(dateString);
  }

  // Handle dd/mm/yyyy or dd/mm/yyyy hh:mm format
  const parts = dateString.trim().split(" ");
  const datePart = parts[0];
  const timePart = parts[1];

  const [day, month, year] = datePart.split("/").map(Number);

  if (timePart) {
    const [hours, minutes] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hours || 0, minutes || 0);
  }

  return new Date(year, month - 1, day);
}

