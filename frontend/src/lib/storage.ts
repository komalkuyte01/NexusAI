import { ResearchResponse, SavedReport } from "@/types";

const STORAGE_KEY = "nexus_saved_reports";

/**
 * Sort reports with pinned chats at the top, then newest saved chats first.
 */
export function sortReports(reports: SavedReport[]): SavedReport[] {
  return [...reports].sort((a, b) => {
    const aPinned = Boolean(a.isPinned);
    const bPinned = Boolean(b.isPinned);

    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;

    if (aPinned && bPinned) {
      const aTime = a.pinnedAt || a.savedAt;
      const bTime = b.pinnedAt || b.savedAt;
      return bTime.localeCompare(aTime);
    }

    return (b.savedAt || "").localeCompare(a.savedAt || "");
  });
}

/**
 * Retrieve all saved reports from localStorage, sorted with pinned items first.
 */
export function getSavedReports(): SavedReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: SavedReport[] = JSON.parse(raw);
    return sortReports(parsed);
  } catch (err) {
    console.error("Failed to read saved reports from localStorage:", err);
    return [];
  }
}

/**
 * Save a research report to localStorage or update if already present.
 */
export function saveReport(report: ResearchResponse, isPinned = false): SavedReport {
  const current = getSavedReports();
  // Check if identical report topic and content already exists
  const existingIndex = current.findIndex(
    (item) => item.topic.trim().toLowerCase() === report.topic.trim().toLowerCase() && item.content === report.content
  );

  let targetSaved: SavedReport;

  if (existingIndex >= 0) {
    const existing = current[existingIndex];
    targetSaved = {
      ...existing,
      ...report,
      savedAt: new Date().toISOString(),
      isPinned: isPinned || existing.isPinned,
      pinnedAt: isPinned ? (existing.pinnedAt || new Date().toISOString()) : existing.pinnedAt,
    };
    current[existingIndex] = targetSaved;
  } else {
    targetSaved = {
      ...report,
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      savedAt: new Date().toISOString(),
      isPinned,
      pinnedAt: isPinned ? new Date().toISOString() : undefined,
    };
    current.unshift(targetSaved);
  }

  const sorted = sortReports(current);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  } catch (err) {
    console.error("Failed to save report to localStorage:", err);
  }

  return targetSaved;
}

/**
 * Toggle pin status for a saved report by ID.
 */
export function togglePinReport(id: string): SavedReport[] {
  const current = getSavedReports();
  const updated = current.map((item) => {
    if (item.id === id) {
      const newPinned = !item.isPinned;
      return {
        ...item,
        isPinned: newPinned,
        pinnedAt: newPinned ? new Date().toISOString() : undefined,
      };
    }
    return item;
  });

  const sorted = sortReports(updated);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  } catch (err) {
    console.error("Failed to update pin status:", err);
  }
  return sorted;
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
