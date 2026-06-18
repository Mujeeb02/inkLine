import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export default function DocumentNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12 bg-transparent select-none">
      <div className="w-full max-w-md rounded-2xl border-2 border-slate-900 bg-white p-10 text-center shadow-panel">
        <p className="font-bold text-xs uppercase tracking-[0.2em] text-[#e05a47]">
          Document unavailable
        </p>
        <h1 className="mt-4 font-black text-2xl text-slate-900 font-sans tracking-tight">
          We couldn't find that document
        </h1>
        <p className="mt-3 text-xs font-bold text-slate-500 leading-relaxed">
          It may have been deleted, or you may not have authorization to view its contents.
        </p>
        <Button asChild className="mt-8 bg-[#ffc300] hover:bg-[#e6b200] text-slate-900 border-2 border-slate-900 shadow-btn transition-all duration-200 font-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs h-10 px-5">
          <Link href="/dashboard">Return to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
