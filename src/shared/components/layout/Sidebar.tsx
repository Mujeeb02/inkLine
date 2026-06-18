"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import {
  Search,
  Plus,
  Upload,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";

import { logoutAction } from "@/modules/user/user.routes";

type SidebarProps = {
  currentUserEmail: string;
  onSearchClick: () => void;
  onCreateDoc: () => void;
  onUploadClick: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
};

export function Sidebar({
  currentUserEmail,
  onSearchClick,
  onCreateDoc,
  onUploadClick,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(() => {
      logoutAction();
    });
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r-2 border-slate-900 bg-[#fbfaf8] transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b-2 border-slate-900">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5 font-sans font-bold text-slate-800 tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffc300] border-2 border-slate-900 text-slate-900 font-mono font-black text-base shadow-sm">
              I
            </span>
            <span className="text-base tracking-wide font-sans font-black text-slate-900">Inkline</span>
          </Link>
        )}
        {isCollapsed && (
          <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffc300] border-2 border-slate-900 text-slate-900 font-mono font-black text-base shadow-sm">
            I
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200/50 hover:text-slate-600 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation & Actions */}
      <div className="flex-1 space-y-6 py-5 px-3 overflow-y-auto">
        {/* Quick Search */}
        <div>
          <button
            onClick={onSearchClick}
            className={`flex w-full items-center gap-2 rounded-lg border-2 border-slate-900 bg-white p-2 text-left text-xs text-slate-400 hover:bg-slate-50 transition-all duration-200 ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-700" />
              {!isCollapsed && <span className="font-bold text-slate-600">Search docs...</span>}
            </span>
            {!isCollapsed && (
              <span className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 font-sans">
                ⌘K
              </span>
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-2 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Actions
            </p>
          )}
          <button
            onClick={onCreateDoc}
            className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200/40 hover:text-slate-900 transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <Plus className="h-4 w-4 text-slate-700" />
            {!isCollapsed && <span>New document</span>}
          </button>

          <button
            onClick={onUploadClick}
            className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200/40 hover:text-slate-900 transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <Upload className="h-4 w-4 text-slate-700" />
            {!isCollapsed && <span>Upload file</span>}
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-2 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Workspace
            </p>
          )}
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all ${
              pathname === "/dashboard"
                ? "bg-[#ffc300] text-slate-900 border-2 border-slate-900 shadow-btn font-black hover:bg-[#ffc300]"
                : "text-slate-600 hover:bg-slate-200/40 hover:text-slate-900"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <BookOpen className="h-4 w-4 text-slate-700" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
        </div>
      </div>

      {/* User profile footer */}
      <div className="border-t-2 border-slate-900 p-3.5 bg-slate-50/50">
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ffc300] border-2 border-slate-900 text-slate-900 font-sans font-bold flex-shrink-0 shadow-sm">
                {currentUserEmail[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-xs font-black text-slate-800">{currentUserEmail.split('@')[0]}</p>
                <p className="text-[10px] font-semibold text-slate-400 truncate max-w-[130px]">{currentUserEmail}</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ffc300] border-2 border-slate-900 text-slate-900 font-sans font-bold shadow-sm">
              {currentUserEmail[0]?.toUpperCase()}
            </div>
          )}
          <form onSubmit={handleLogout} className={isCollapsed ? "hidden" : "block"}>
            <button
              disabled={isPending}
              type="submit"
              aria-label="Logout"
              className="rounded-lg p-2 border border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95 flex items-center justify-center"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
