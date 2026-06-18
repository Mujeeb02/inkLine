import * as React from "react";
import { cn } from "@/shared/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex h-10 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-foreground shadow-sm transition-all placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-[#94a3b8] focus-visible:ring-1 focus-visible:ring-[#94a3b8] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
