"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import {
  Lock,
  Mail,
  AlertCircle,
  Disc3,
  ArrowRight,
  User,
} from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { loginUser } from "./authThunks";
import { clearAuthError } from "./authSlice";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    dispatch(clearAuthError());

    try {
      const result = await dispatch(
        loginUser({ email, password, name: signup ? name : undefined }),
      );

      const res = await signIn("credentials", {
        email,
        password,
        name: signup ? name : undefined,
        redirect: false,
      });

      if (loginUser.fulfilled.match(result) && !res?.error) {
        router.push("/");
      } else if (res?.error) {
        setError("Authentication failed. Please verify your email and password.");
        setIsLoading(false);
      } else {
        router.push("/");
      }
    } catch {
      setError("Failed to authenticate. Please check your credentials.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    dispatch(clearAuthError());
    try {
      const res = await signIn("google", { callbackUrl: "/", redirect: true });
      if (res?.error) {
        setError("Google authentication failed. Please try again.");
        setIsLoading(false);
      }
    } catch {
      setError("Could not connect to Google OAuth servers.");
      setIsLoading(false);
    }
  };

  const handleSpotifyLogin = () => {
    signIn("spotify", { callbackUrl: "/" });
  };

  return (
    <GlassCard className="login-panel w-full max-w-md p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-900 text-white dark:bg-white dark:text-stone-900 mb-3 shadow-md">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Welcome to Pulse
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Your stories, sounds, and saved discoveries.
        </p>
      </div>

      {/* Auth Mode Tabs */}
      <div className="flex bg-stone-100 dark:bg-stone-800/80 p-1 rounded-2xl mb-5 border border-stone-200/60 dark:border-stone-700/60">
        <button
          type="button"
          onClick={() => {
            setSignup(false);
            setError(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            !signup
              ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm"
              : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setSignup(true);
            setError(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            signup
              ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm"
              : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
          }`}
        >
          Create Account
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Continue with Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full mb-3 py-3 px-4 rounded-2xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700/80 text-stone-800 dark:text-stone-100 font-bold text-xs flex items-center justify-center gap-3 border border-stone-200 dark:border-stone-700 shadow-xs transition-transform hover:scale-[1.02] cursor-pointer"
      >
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Continue with Google</span>
        <ArrowRight className="w-3.5 h-3.5 ml-auto text-stone-400" />
      </button>

      {/* Continue with Spotify */}
      <button
        type="button"
        onClick={handleSpotifyLogin}
        className="w-full mb-4 py-3 px-4 rounded-2xl bg-[#1db954] hover:bg-[#1aa34a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform hover:scale-[1.02] cursor-pointer"
      >
        <Disc3 className="w-4 h-4" />
        <span>Continue with Spotify</span>
        <ArrowRight className="w-3.5 h-3.5 ml-auto" />
      </button>

      <div className="relative flex items-center justify-center mb-5">
        <div className="border-t border-stone-200 dark:border-stone-800 w-full" />
        <span className="bg-white dark:bg-stone-900 px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider absolute">
          Or continue with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {signup && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                aria-label="Your name"
                placeholder="Your full name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              aria-label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="youremail@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              aria-label="Password"
              minLength={6}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full mt-2 py-3 cursor-pointer"
        >
          {signup ? "Create account" : "Sign In"}
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-center text-xs text-stone-500">
        <button
          type="button"
          className="hover:underline cursor-pointer"
          onClick={() => setSignup(!signup)}
        >
          {signup
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
      </div>
    </GlassCard>
  );
};

export default LoginForm;
