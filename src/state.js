import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { METRIC_KEYS } from "./core/metrics.js";

const getTodayDate = () => {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0); // Set the time to midnight UTC
  return now.toISOString().split("T")[0];
};

export const apiKeyState = atomWithStorage("apiKey", "");
export const organizationState = atomWithStorage("organization", "");
export const startDateState = atomWithStorage("startDate", getTodayDate());
export const endDateState = atomWithStorage("endDate", getTodayDate());
export const repositoriesState = atomWithStorage("repositories", "");
export const configOpenState = atomWithStorage("configOpen", true);
export const sortState = atomWithStorage("sort", "");
export const summedState = atomWithStorage("summed", false);
export const ignoreUsersState = atomWithStorage("ignoreUsers", "");
export const metricsState = atomWithStorage("metrics", METRIC_KEYS);

// Persisted to IndexedDB via `usePersistData` — the raw GitHub payload is far
// too large for localStorage. Kept in-memory here and hydrated on mount.
export const dataState = atom({});
export const rawDataState = atom({});
