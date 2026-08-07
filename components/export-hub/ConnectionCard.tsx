"use client";

import { useState } from "react";
import { Table, Box, HardDrive, RefreshCw, Unplug, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConnectModal } from "@/components/export-hub/ConnectModal";
import { StatusChip } from "@/components/export-hub/StatusChip";
import { useConnections } from "@/hooks/useConnections";
import { CONNECTION_META, type ConnectionId } from "@/lib/integrations/types";
import { formatRelativeTime } from "@/lib/format";

const CONNECTION_ICONS: Record<ConnectionId, LucideIcon> = {
  "google-sheets": Table,
  dropbox: Box,
  onedrive: HardDrive,
};

export function ConnectionCard({ id }: { id: ConnectionId }) {
  const { connections, disconnect, sync } = useConnections();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const meta = CONNECTION_META[id];
  const Icon = CONNECTION_ICONS[id];
  const connection = connections[id];
  const isConnected = connection.status === "connected";

  function handleDisconnect() {
    disconnect(id);
    toast.success(`Disconnected from ${meta.name}`);
  }

  function handleSync() {
    sync(id);
    toast.success(`${meta.name} sync refreshed (demo)`);
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-hover text-foreground">
          <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
        </span>
        <StatusChip tone={isConnected ? "success" : "neutral"}>
          {isConnected ? "Connected" : "Not connected"}
        </StatusChip>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">{meta.name}</h3>
        <p className="mt-1 text-xs leading-relaxed text-secondary">{meta.description}</p>
      </div>

      {isConnected ? (
        <div className="mt-1 flex flex-col gap-2">
          <p className="truncate text-xs text-muted">
            {connection.email} · synced {connection.lastSyncAt ? formatRelativeTime(connection.lastSyncAt) : "never"}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleSync} className="flex-1">
              <RefreshCw className="h-3.5 w-3.5" />
              Sync now
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDisconnect}>
              <Unplug className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)} className="mt-1">
          Connect
        </Button>
      )}

      {isModalOpen && <ConnectModal connectionId={id} onClose={() => setIsModalOpen(false)} />}
    </Card>
  );
}
