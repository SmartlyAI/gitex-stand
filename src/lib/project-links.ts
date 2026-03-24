import { DEFAULT_STAND_FLOOR_SETTINGS } from "@/lib/stand-floor";
import { StandPlan } from "@/lib/types";

export interface StoredProjectLink {
  planId: string;
  planName: string;
  url: string;
  updatedAt: string;
}

const STORAGE_KEY = "gitex-stand-project-links";

export function buildPlanPath(
  planId: string,
  mode: "editor" | "readonly" = "editor"
): string {
  return `/plan/${planId}?mode=${mode}`;
}

export function createEmptyPlan(
  planId: string,
  planName = "Nouveau projet"
): StandPlan {
  return {
    planId,
    planName,
    dimensions: { width: 6, depth: 5 },
    floorSettings: { ...DEFAULT_STAND_FLOOR_SETTINGS },
    elements: [],
    history: [],
    historyIndex: -1,
  };
}

export function readStoredProjectLinks(): StoredProjectLink[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue) as StoredProjectLink[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (entry) =>
          typeof entry?.planId === "string" &&
          typeof entry?.planName === "string" &&
          typeof entry?.url === "string" &&
          typeof entry?.updatedAt === "string"
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export function upsertStoredProjectLink(project: StoredProjectLink): StoredProjectLink[] {
  if (typeof window === "undefined") {
    return [project];
  }

  const nextProjects = [
    project,
    ...readStoredProjectLinks().filter((entry) => entry.planId !== project.planId),
  ].slice(0, 20);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));
  return nextProjects;
}

export function toAbsoluteProjectUrl(path: string): string {
  if (typeof window === "undefined") {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}

export function toRelativeProjectUrl(url: string): string {
  if (typeof window === "undefined") {
    return url;
  }

  const parsed = new URL(url, window.location.origin);
  return `${parsed.pathname}${parsed.search}`;
}
