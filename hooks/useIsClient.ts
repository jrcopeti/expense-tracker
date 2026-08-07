import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * True once the component has hydrated on the client. Backed by
 * useSyncExternalStore (server snapshot false, client snapshot true)
 * instead of a useEffect+setState flag, so it never triggers the extra
 * render a manual "hasMounted" effect would (and stays clean under the
 * react-hooks/set-state-in-effect rule).
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
