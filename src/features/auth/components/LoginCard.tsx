"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { loginAction, signUpAction, quickLoginAction } from "@/modules/user/user.routes";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

type LoginCardProps = {
  users: { label: string; email: string }[];
  nextPath?: string;
};

export function LoginCard({ users, nextPath }: LoginCardProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const errorCode = searchParams ? searchParams.get("error") : null;

  const getErrorMessage = (code: string | null) => {
    if (!code) return null;
    const decoded = decodeURIComponent(code);
    switch (decoded) {
      case "invalid-user":
        return "Invalid email address.";
      case "user-not-found":
        return "No account found with this email. Please sign up first.";
      case "invalid-password":
        return "Incorrect password. Please try again.";
      case "use-quick-login":
        return "This is a demo account — use the Quick Login buttons below instead.";
      case "invalid-credentials":
        return "Invalid email or password.";
      case "user-exists":
        return "This email is already registered. Please sign in instead.";
      case "invalid-email":
        return "Please enter a valid email address.";
      case "Password must be at least 8 characters":
      case "Password must contain at least one letter":
      case "Password must contain at least one number":
        return decoded;
      default:
        return decoded.length > 2 && !decoded.includes("@") ? decoded : "An unexpected error occurred.";
    }
  };

  const handleFormSubmit = (
    event: React.FormEvent<HTMLFormElement>,
    action: (formData: FormData) => Promise<void>,
  ) => {
    event.preventDefault();
    if (isPending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await action(formData);
    });
  };

  const errorMessage = getErrorMessage(errorCode);

  return (
    <div className="w-full max-w-md rounded-2xl border-2 border-slate-900 bg-white p-8 shadow-panel relative overflow-hidden transition-all duration-300">
      {/* Background Gradient Accents */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-yellow-100/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-red-100/40 blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center space-y-3.5 relative z-10">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#ffc300] text-slate-900 border-2 border-slate-900 font-mono font-black text-2xl shadow-btn">
          I
        </span>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 font-sans">
          Welcome to Inkline
        </h1>
        <p className="text-xs font-bold text-slate-500 max-w-xs mx-auto leading-relaxed">
          Create documents, invite collaborators, and organize ideas in real time.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mt-8 flex rounded-xl bg-slate-100 border-2 border-slate-900 p-1 relative z-10">
        <button
          type="button"
          onClick={() => setActiveTab("signin")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black rounded-lg transition-all ${
            activeTab === "signin"
              ? "bg-[#ffc300] text-slate-900 border-2 border-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <LogIn className="h-3.5 w-3.5" />
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("signup")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black rounded-lg transition-all ${
            activeTab === "signup"
              ? "bg-[#ffc300] text-slate-900 border-2 border-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Sign Up
        </button>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border-2 border-slate-900 bg-red-50 p-3.5 text-red-700 animate-fade-in relative z-10 shadow-btn">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs font-bold leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {/* Authentication Forms */}
      <div className="mt-6 relative z-10">
        {activeTab === "signin" ? (
          <form
            onSubmit={(e) => handleFormSubmit(e, loginAction)}
            className="space-y-4 animate-fade-in"
          >
            {nextPath && <input type="hidden" name="nextPath" value={nextPath} />}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email-signin" className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input
                  id="email-signin"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="pl-10 border-2 border-slate-900 focus-visible:ring-0 focus-visible:border-slate-900 focus-visible:shadow-btn text-xs font-bold"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password-signin" className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input
                  id="password-signin"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="pl-10 pr-10 border-2 border-slate-900 focus-visible:ring-0 focus-visible:border-slate-900 focus-visible:shadow-btn text-xs font-bold"
                  disabled={isPending}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 flex items-center justify-center gap-2 mt-4 bg-[#e05a47] text-white hover:bg-[#d64c38] border-2 border-slate-900 shadow-btn transition-all duration-200 font-bold active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs"
            >
              {isPending ? "Signing in..." : "Continue to Workspace"}
              {!isPending && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={(e) => handleFormSubmit(e, signUpAction)}
            className="space-y-4 animate-fade-in"
          >
            {nextPath && <input type="hidden" name="nextPath" value={nextPath} />}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email-signup" className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input
                  id="email-signup"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="pl-10 border-2 border-slate-900 focus-visible:ring-0 focus-visible:border-slate-900 focus-visible:shadow-btn text-xs font-bold"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password-signup" className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input
                  id="password-signup"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min. 8 chars, 1 letter, 1 number"
                  className="pl-10 pr-10 border-2 border-slate-900 focus-visible:ring-0 focus-visible:border-slate-900 focus-visible:shadow-btn text-xs font-bold"
                  disabled={isPending}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">
                At least 8 characters · 1 letter · 1 number
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirm-password-signup" className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input
                  id="confirm-password-signup"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter your password"
                  className="pl-10 pr-10 border-2 border-slate-900 focus-visible:ring-0 focus-visible:border-slate-900 focus-visible:shadow-btn text-xs font-bold"
                  disabled={isPending}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 flex items-center justify-center gap-2 mt-4 bg-[#ffc300] text-slate-900 hover:bg-[#e6b200] border-2 border-slate-900 shadow-btn transition-all duration-200 font-bold active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs"
            >
              {isPending ? "Creating account..." : "Create Account"}
              {!isPending && <Sparkles className="h-4 w-4 text-amber-700 animate-pulse-slow" />}
            </Button>
          </form>
        )}
      </div>

      {/* Developer Shortcut Login List */}
      <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200 relative z-10">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-center mb-4">
          Quick Developer Logins
        </p>
        <div className="grid grid-cols-3 gap-2">
          {users.map((user) => (
            <form
              key={user.email}
              onSubmit={(e) => handleFormSubmit(e, quickLoginAction)}
              className="w-full"
            >
              <input type="hidden" name="email" value={user.email} />
              {nextPath && <input type="hidden" name="nextPath" value={nextPath} />}
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex flex-col items-center justify-center rounded-lg border-2 border-slate-900 bg-white p-2.5 text-center transition-all duration-200 hover:bg-slate-50 hover:shadow-btn active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ffc300] border border-slate-900 text-slate-900 font-sans font-black text-[10px] mb-1">
                  {user.label[0]}
                </span>
                <span className="text-[10px] font-bold text-slate-900">{user.label}</span>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
