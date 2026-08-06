import { useSyncExternalStore } from "react";

function subscribe() {
  // Nothing to subscribe to - this never changes after mount.
  return () => {};
}

/**
 * True once the component has hydrated on the client. Backed by
 * useSyncExternalStore (server snapshot false, client snapshot true) instead
 * of a useEffect+setState flag, so it never triggers the extra render a
 * manual "hasMounted" effect would.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
