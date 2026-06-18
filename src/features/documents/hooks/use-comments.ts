import { useEffect, useState, useCallback } from "react";

export type CommentSelection = {
  from: number;
  to: number;
  text: string;
};

export type Comment = {
  id: string;
  documentId: string;
  authorId: string;
  authorEmail: string;
  body: string;
  resolved: boolean;
  selection?: CommentSelection;
  createdAt: string;
  updatedAt: string;
};

export function useComments(documentId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!documentId) {
      return;
    }
    try {
      const res = await fetch(`/api/documents/${documentId}/comments`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.comments)) {
          setComments(data.comments);
        }
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  }, [documentId]);

  useEffect(() => {
    setLoading(true);
    fetchComments().finally(() => setLoading(false));

    // Poll for new comments every 8 seconds
    const interval = setInterval(fetchComments, 8000);
    return () => clearInterval(interval);
  }, [documentId, fetchComments]);

  const addComment = async (body: string, selection?: CommentSelection) => {
    try {
      const res = await fetch(`/api/documents/${documentId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body, selection }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchComments();
        return data.comment;
      }
      throw new Error(data.error || "Failed to add comment");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const resolveComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
      });
      if (res.ok) {
        await fetchComments();
        return;
      }
      throw new Error("Failed to resolve comment");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchComments();
        return;
      }
      throw new Error("Failed to delete comment");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    comments,
    loading,
    refresh: fetchComments,
    addComment,
    resolveComment,
    deleteComment,
  };
}
