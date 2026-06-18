"use client";

import React from "react";
import type { ActiveUser } from "../hooks/use-presence";

type PresenceAvatarsProps = {
  users: ActiveUser[];
};

const COLORS = [
  "bg-[#ff595e] text-white",
  "bg-[#ffca3a] text-slate-900",
  "bg-[#8ac926] text-white",
  "bg-[#1982c4] text-white",
  "bg-[#6a4c93] text-white",
  "bg-[#ff9f1c] text-white",
];

function getColorForEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

export function PresenceAvatars({ users }: PresenceAvatarsProps) {
  if (!users || users.length === 0) {
    return null;
  }

  const limit = 4;
  const visibleUsers = users.slice(0, limit);
  const remainingCount = users.length - limit;

  return (
    <div className="flex items-center -space-x-1.5">
      {visibleUsers.map((user) => {
        const initials = user.email[0].toUpperCase();
        const colorClass = getColorForEmail(user.email);
        return (
          <div
            key={user.userId}
            title={user.email}
            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 ${colorClass} text-[10px] font-black shadow-sm flex-shrink-0 cursor-default select-none transition-all duration-200 hover:-translate-y-0.5 hover:z-10`}
          >
            {initials}
          </div>
        );
      })}

      {remainingCount > 0 && (
        <div
          title={`${remainingCount} more users viewing`}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-100 text-slate-800 text-[9px] font-black shadow-sm flex-shrink-0 cursor-default select-none"
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
