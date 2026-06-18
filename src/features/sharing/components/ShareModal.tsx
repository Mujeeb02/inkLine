"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/components/providers/ToastProvider";
import { SharingClientService } from "@/features/sharing/services/sharing";
import { Mail, Share2, User, Search, CheckCircle, Trash2 } from "lucide-react";
import type { SharedEntry } from "@/modules/document/document.types";

type ShareModalProps = {
  documentId: string;
  sharedWith: SharedEntry[];
  trigger?: React.ReactNode;
};

export function ShareModal({ documentId, sharedWith, trigger }: ShareModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "commenter" | "editor">("editor");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<{ email: string }[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<{ email: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const res = await fetch("/api/users");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.users)) {
              setAllUsers(data.users);
            }
          }
        } catch (err) {
          console.error("Failed to load users for dropdown:", err);
        } finally {
          setIsLoadingUsers(false);
        }
      };
      fetchUsers();
    } else {
      setAllUsers([]);
      setFilteredUsers([]);
      setShowDropdown(false);
      setEmail("");
      setRole("editor");
    }
  }, [isOpen]);

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter users based on query
  const handleInputChange = (val: string) => {
    setEmail(val);
    if (!val.trim()) {
      setFilteredUsers(allUsers);
      setShowDropdown(allUsers.length > 0);
      return;
    }

    const matched = allUsers.filter((u) =>
      u.email.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredUsers(matched);
    setShowDropdown(matched.length > 0);
  };

  const handleInputFocus = () => {
    if (allUsers.length > 0) {
      if (!email.trim()) {
        setFilteredUsers(allUsers);
      }
      setShowDropdown(true);
    }
  };

  const selectUser = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleShare = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;

    startTransition(async () => {
      try {
        const result = await SharingClientService.shareDocument(documentId, email.trim(), role);
        toast(`Successfully shared with ${result.share.sharedWith}`, "success");
        setEmail("");
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to share document";
        toast(message, "error");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-2 border-slate-900 font-bold text-xs shadow-btn hover:bg-slate-50 hover:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md border-2 border-slate-900 shadow-panel bg-white rounded-2xl overflow-visible">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffc300] border-2 border-slate-900 text-slate-900 shadow-btn">
              <Share2 className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle className="text-base font-black text-slate-900">Share document</DialogTitle>
              <DialogDescription className="text-[11px] text-slate-500 font-semibold">
                Grant view or edit access to a collaborator.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleShare} className="mt-2 space-y-4">
          <div className="relative" ref={dropdownRef}>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Collaborator Email & Role
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                {isLoadingUsers ? (
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-pulse" />
                ) : (
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                )}
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder={isLoadingUsers ? "Loading users..." : "Search by email or type address"}
                  value={email}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={handleInputFocus}
                  className="pl-10 border-2 border-slate-900 focus-visible:ring-0 focus-visible:border-slate-900 focus-visible:shadow-btn text-xs font-bold"
                  required
                  disabled={isPending}
                  autoComplete="off"
                />

                {/* Searchable Dropdown */}
                {showDropdown && filteredUsers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-48 overflow-y-auto rounded-xl border-2 border-slate-900 bg-white shadow-panel animate-fade-in">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                        {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
                      </p>
                    </div>
                    {filteredUsers.map((user) => (
                      <button
                        key={user.email}
                        type="button"
                        onClick={() => selectUser(user.email)}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 ${
                          email === user.email ? "bg-yellow-50" : ""
                        }`}
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ffc300] border border-slate-900 text-slate-900 font-black text-[9px] flex-shrink-0">
                          {user.email[0].toUpperCase()}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 flex-1 min-w-0 truncate">
                          {user.email}
                        </span>
                        {email === user.email && (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Empty state when no matches */}
                {showDropdown && filteredUsers.length === 0 && email.trim() && !isLoadingUsers && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1.5 rounded-xl border-2 border-slate-900 bg-white shadow-panel py-3 px-3 text-center">
                    <User className="h-5 w-5 text-slate-300 mx-auto mb-1" />
                    <p className="text-[11px] font-semibold text-slate-400">No users match "{email}"</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">You can still share with any valid email.</p>
                  </div>
                )}
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="border-2 border-slate-900 rounded-xl bg-white px-2.5 text-xs font-bold outline-none focus:border-slate-900 focus:shadow-btn transition"
                disabled={isPending}
              >
                <option value="viewer">Viewer</option>
                <option value="commenter">Commenter</option>
                <option value="editor">Editor</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="border-2 border-slate-900 font-bold text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !email.trim()}
              className="bg-[#ffc300] text-slate-900 hover:bg-[#e6b200] border-2 border-slate-900 shadow-btn font-bold text-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              {isPending ? "Sharing..." : "Share"}
            </Button>
          </DialogFooter>
        </form>

        {sharedWith && sharedWith.length > 0 && (
          <div className="mt-4 border-t-2 border-slate-100 pt-4">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
              Who has access
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {sharedWith.map((entry) => (
                <div key={entry.userId} className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 border-2 border-slate-900 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ffc300] border border-slate-900 text-slate-900 font-black text-[10px] flex-shrink-0">
                      {entry.email[0].toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate" title={entry.email}>
                        {entry.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={entry.role}
                      onChange={async (e) => {
                        const newRole = e.target.value;
                        try {
                          await SharingClientService.updateShareRole(documentId, entry.userId, newRole);
                          toast(`Updated role for ${entry.email} to ${newRole}`, "success");
                          router.refresh();
                        } catch (err) {
                          toast("Failed to update role", "error");
                        }
                      }}
                      className="border border-slate-350 bg-white rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="commenter">Commenter</option>
                      <option value="editor">Editor</option>
                    </select>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await SharingClientService.removeShare(documentId, entry.userId);
                          toast(`Removed access for ${entry.email}`, "success");
                          router.refresh();
                        } catch (err) {
                          toast("Failed to remove user", "error");
                        }
                      }}
                      className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 border border-transparent hover:border-red-200 transition"
                      title="Remove access"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
