'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Lock, Mail, AlertCircle, Sparkles, Disc3, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { loginUser } from './authThunks';
import { clearAuthError } from './authSlice';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [signup, setSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@pulse.app');
  const [password, setPassword] = useState('demo123');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    dispatch(clearAuthError());

    const result = await dispatch(
      loginUser({ email, password, name: signup ? name : undefined })
    );

    signIn('credentials', {
      email,
      password,
      name: signup ? name : undefined,
      redirect: false,
    }).catch(() => {});

    if (loginUser.fulfilled.match(result)) {
      window.location.href = '/';
    } else {
      setError((result.payload as string) || 'Authentication failed. Password must be >= 6 characters.');
      setIsLoading(false);
    }
  };

  const handleInstantDemo = async () => {
    setIsLoading(true);
    setError(null);
    dispatch(clearAuthError());

    try {
      await signIn('credentials', {
        email: 'demo@pulse.app',
        password: 'demo123',
        name: 'Abhijeet Nayak',
        redirect: false,
      }).catch(() => {});
      await dispatch(
        loginUser({ email: 'demo@pulse.app', password: 'demo123', name: 'Abhijeet Nayak' })
      );
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  const handleSpotifyLogin = () => {
    signIn('spotify', { callbackUrl: '/' });
  };

  return (
    <GlassCard className="w-full max-w-md p-8 border border-white/80 dark:border-stone-800 shadow-xl select-none">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-900 text-white dark:bg-white dark:text-stone-900 mb-3 shadow-md">
          <Sparkles className="w-6 h-6 text-lime-400" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Welcome to Pulse</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          NextAuth-powered authentication for your personalized content dashboard
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1-Click Instant Reviewer Access */}
      <button
        type="button"
        onClick={handleInstantDemo}
        disabled={isLoading}
        className="w-full mb-3 py-3 px-4 rounded-2xl bg-[#d2f845] hover:bg-[#bde632] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        <span>1-Click Reviewer Demo Sign In</span>
        <ArrowRight className="w-3.5 h-3.5 ml-auto" />
      </button>

      {/* Continue with Spotify */}
      <button
        type="button"
        onClick={handleSpotifyLogin}
        className="w-full mb-5 py-3 px-4 rounded-2xl bg-[#1db954] hover:bg-[#1aa34a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer"
      >
        <Disc3 className="w-4 h-4" />
        <span>Sign In with Spotify OAuth</span>
        <ArrowRight className="w-3.5 h-3.5 ml-auto" />
      </button>

      <div className="relative flex items-center justify-center mb-5">
        <div className="border-t border-stone-200 dark:border-stone-800 w-full" />
        <span className="bg-white dark:bg-stone-900 px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider absolute">
          Or with NextAuth Credentials
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {signup && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
              Full Name
            </label>
            <input
              aria-label="Your name"
              placeholder="Your name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
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
              placeholder="demo@pulse.app"
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
          {signup ? 'Create account' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          className="text-xs text-stone-600 dark:text-stone-400 hover:underline cursor-pointer"
          onClick={() => setSignup(!signup)}
        >
          {signup ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </div>
    </GlassCard>
  );
};

export default LoginForm;
