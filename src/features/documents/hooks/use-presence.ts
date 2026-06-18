import { useEffect, useState } from "react";

export type ActiveUser = {
  userId: string;
  email: string;
  lastSeen: string;
};

export function usePresence(documentId: string) {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  useEffect(() => {
    if (!documentId) return;

    const sendHeartbeat = async () => {
      try {
        await fetch(`/api/documents/${documentId}/presence`, {
          method: "POST",
        });
      } catch (err) {
        console.error("Presence heartbeat failed:", err);
      }
    };

    const fetchActiveUsers = async () => {
      try {
        const res = await fetch(`/api/documents/${documentId}/presence`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.users)) {
            setActiveUsers(data.users);
          }
        }
      } catch (err) {
        console.error("Failed to fetch active users:", err);
      }
    };

    // Trigger initial requests immediately
    sendHeartbeat();
    fetchActiveUsers();

    // Send heartbeat every 12 seconds
    const heartbeatInterval = setInterval(sendHeartbeat, 12000);

    // Fetch active users every 12 seconds, staggered by 6 seconds to optimize server load
    let pollInterval: NodeJS.Timeout;
    const staggerTimeout = setTimeout(() => {
      fetchActiveUsers();
      pollInterval = setInterval(fetchActiveUsers, 12000);
    }, 6000);

    return () => {
      clearInterval(heartbeatInterval);
      clearTimeout(staggerTimeout);
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [documentId]);

  return activeUsers;
}
