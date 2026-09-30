import { ResearchResponse, SavedReport } from "@/types";

const STORAGE_KEY = "nexus_saved_reports";

/**
 * Retrieve all saved reports from localStorage.
 */
export function getSavedReports(): SavedReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to read saved reports from localStorage:", err);
    return [];
  }
}

/**
 * Save a research report to localStorage.
 */
export function saveReport(report: ResearchResponse): SavedReport {
  const current = getSavedReports();
  const newSaved: SavedReport = {
    ...report,
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    savedAt: new Date().toISOString(),
  };

  const updated = [newSaved, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save report to localStorage:", err);
  }

  return newSaved;
}

/**
 * Delete a specific saved report by ID.
 */
export function deleteSavedReport(id: string): SavedReport[] {
  const current = getSavedReports();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to update saved reports:", err);
  }
  return updated;
}

/**
 * Clear all saved reports.
 */
export function clearAllSavedReports(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear saved reports:", err);
  }
}
