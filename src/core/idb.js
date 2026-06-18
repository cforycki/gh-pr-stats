/**
 * Minimal IndexedDB key/value store.
 *
 * The raw GitHub payload (every PR with its comments and reviews) easily blows
 * past the ~5MB localStorage quota, so analysis results are persisted here
 * instead. IndexedDB stores structured-clone values directly (no JSON string),
 * allows hundreds of MB, and is available on a static GitHub Pages host.
 */
const DB_NAME = "gh-pr-stats";
const STORE_NAME = "kv";

let dbPromise;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
};

const runTransaction = async (mode, operation) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);
    transaction.oncomplete = () => resolve(request?.result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
};

export const idbGet = (key) => runTransaction("readonly", (store) => store.get(key));

export const idbSet = (key, value) => runTransaction("readwrite", (store) => store.put(value, key));

export const idbDelete = (key) => runTransaction("readwrite", (store) => store.delete(key));
