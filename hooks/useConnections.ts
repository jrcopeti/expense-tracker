"use client";

import { useCallback, useSyncExternalStore } from "react";
import * as store from "@/lib/integrations/connectionsStore";
import type { ConnectionId } from "@/lib/integrations/types";
import { useIsClient } from "./useIsClient";

export function useConnections() {
  const connections = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const isClient = useIsClient();

  const connect = useCallback((id: ConnectionId, email: string) => store.connect(id, email), []);
  const disconnect = useCallback((id: ConnectionId) => store.disconnect(id), []);
  const sync = useCallback((id: ConnectionId) => store.touchSync(id), []);

  return { connections, isLoading: !isClient, connect, disconnect, sync };
}
