type CacheEntry = {
  status: boolean;
  expiresAt: number;
};

const CACHE_TTL_MS = 1000 * 60 * 5;

declare global {
  // eslint-disable-next-line no-var
  var __subscriptionCache: Map<string, CacheEntry> | undefined;
}

const getStore = () => {
  if (!globalThis.__subscriptionCache) {
    globalThis.__subscriptionCache = new Map();
  }
  return globalThis.__subscriptionCache;
};

export const getCachedSubscription = (customerId: string) => {
  const store = getStore();
  const entry = store.get(customerId);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    store.delete(customerId);
    return null;
  }
  return entry.status;
};

export const setCachedSubscription = (customerId: string, status: boolean) => {
  const store = getStore();
  store.set(customerId, {
    status,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
};

export const clearCachedSubscription = (customerId: string) => {
  const store = getStore();
  store.delete(customerId);
};
