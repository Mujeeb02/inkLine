"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";

type WorkspaceLayoutProps = {
  currentUserEmail: string;
  onSearchClick: () => void;
  onCreateDoc: () => void;
  onUploadClick: () => void;
  children: React.ReactNode;
};

export function WorkspaceLayout({
  currentUserEmail,
  onSearchClick,
  onCreateDoc,
  onUploadClick,
  children,
}: WorkspaceLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar
        currentUserEmail={currentUserEmail}
        onSearchClick={onSearchClick}
        onCreateDoc={onCreateDoc}
        onUploadClick={onUploadClick}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div
        className={`transition-all duration-300 min-h-screen flex flex-col ${
          isCollapsed ? "pl-16" : "pl-64"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
