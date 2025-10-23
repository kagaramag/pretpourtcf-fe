import moment from "moment";

/**
 * Format a date to "11th Oct 2025"
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return "N/A";
  return moment(date).format("Do MMM YYYY");
}

/**
 * Format a date to "11 Oct 2025" (without ordinal)
 */
export function formatDateShort(date: string | Date | undefined): string {
  if (!date) return "N/A";
  return moment(date).format("D MMM YYYY");
}

/**
 * Format a date to "11th Oct 2025, 3:45 PM"
 */
export function formatDateTime(date: string | Date | undefined): string {
  if (!date) return "N/A";
  return moment(date).format("Do MMM YYYY, h:mm A");
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date | undefined): string {
  if (!date) return "N/A";
  return moment(date).fromNow();
}

/**
 * Format a date to full format "11th October 2025"
 */
export function formatDateFull(date: string | Date | undefined): string {
  if (!date) return "N/A";
  return moment(date).format("Do MMMM YYYY");
}
