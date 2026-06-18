import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { idbGet, idbSet } from "./core/idb.js";
import { dataState, rawDataState } from "./state.js";

/**
 * Reads a value previously persisted by `atomWithStorage` and clears it.
 * Lets existing users keep their last analysis when upgrading from the
 * localStorage-backed version, while freeing the (often oversized) entry.
 */
const takeFromLocalStorage = (key) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) {
      return undefined;
    }
    window.localStorage.removeItem(key);
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

/**
 * Hydrates the analysis atoms from IndexedDB on mount and writes them back on
 * change. Persistence is best-effort: a failure to read or write never breaks
 * the page, the user can always re-run the analysis.
 */
export const usePersistData = () => {
  const [data, setData] = useAtom(dataState);
  const [rawData, setRawData] = useAtom(rawDataState);
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [storedData, storedRawData] = await Promise.all([idbGet("data"), idbGet("rawData")]);

        // Always drain legacy localStorage entries to reclaim space, even when
        // IndexedDB already holds fresher data.
        const migratedData = takeFromLocalStorage("data");
        const migratedRawData = takeFromLocalStorage("rawData");

        if (cancelled) {
          return;
        }

        const nextData = storedData ?? migratedData;
        const nextRawData = storedRawData ?? migratedRawData;
        if (nextData) {
          setData(nextData);
        }
        if (nextRawData) {
          setRawData(nextRawData);
        }
      } finally {
        hydrated.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setData, setRawData]);

  useEffect(() => {
    if (!hydrated.current) {
      return;
    }
    idbSet("data", data).catch(() => {});
  }, [data]);

  useEffect(() => {
    if (!hydrated.current) {
      return;
    }
    idbSet("rawData", rawData).catch(() => {});
  }, [rawData]);
};
