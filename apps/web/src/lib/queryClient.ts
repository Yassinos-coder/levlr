import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const PERSISTED_QUERY_ROOTS = ['workspace'];

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, gcTime: ONE_DAY_MS, retry: 1 } },
});

export const queryPersister = createSyncStoragePersister({ storage: window.localStorage, key: 'levlr.query-cache' });

export const persistOptions = {
  persister: queryPersister,
  maxAge: ONE_DAY_MS,
  dehydrateOptions: {
    shouldDehydrateQuery: (query: { queryKey: readonly unknown[]; state: { status: string } }) =>
      query.state.status === 'success' && PERSISTED_QUERY_ROOTS.includes(String(query.queryKey[0])),
  },
};
