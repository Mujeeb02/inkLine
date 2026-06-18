import { useEffect, useState, useCallback } from "react";

export type Version = {
  id: string;
  documentId: string;
  savedBy: string;
  savedByEmail: string;
  title: string;
  content: any;
  version: number;
  createdAt: string;
};

export function useVersions(documentId: string) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVersions = useCallback(async () => {
    if (!documentId) {
      return;
    }
    try {
      const res = await fetch(`/api/documents/${documentId}/versions`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.versions)) {
          setVersions(data.versions);
        }
      }
    } catch (err) {
      console.error("Failed to fetch version history:", err);
    }
  }, [documentId]);

  useEffect(() => {
    setLoading(true);
    fetchVersions().finally(() => setLoading(false));
  }, [documentId, fetchVersions]);

  const restoreVersion = async (versionId: string) => {
    try {
      const res = await fetch(`/api/documents/${documentId}/versions/${versionId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchVersions();
        return data.document;
      }
      throw new Error(data.error || "Failed to restore version");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    versions,
    loading,
    refresh: fetchVersions,
    restoreVersion,
  };
}
