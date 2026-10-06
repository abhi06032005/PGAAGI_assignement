'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser } from './authThunks';
import { clearAuthError } from './authSlice';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [signup, setSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@pulse.app');
  const [password, setPassword] = useState('demo123');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(loginUser({ email, password, name: signup ? name : undefined }));
    if (loginUser.fulfilled.match(result)) {
      router.push('/');
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@pulse.app');
    setPassword('demo123');
  };

  return (
    <GlassCard className="w-full max-w-md p-8 border border-white/80 dark:border-stone-800 shadow-xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-900 text-white dark:bg-white dark:text-stone-900 mb-3 shadow-md">
          <Sparkles className="w-6 h-6 text-lime-400" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Welcome to Pulse</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Sign in to access your personalized content dashboard
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-stone-500 mb-4">Demo account: this is a local mock sign-in. No password is stored or sent.</p><form onSubmit={handleSubmit} className="space-y-4">{signup && <input aria-label="Your name" placeholder="Your name" required value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 rounded-xl border border-stone-300"/>}
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
          className="w-full mt-2 py-3"
        >
          {signup ? 'Create account' : 'Sign In'}
        </Button>
      </form>

      <button type="button" className="mt-4 text-sm underline" onClick={()=>setSignup(!signup)}>{signup ? 'Already have an account? Sign in' : 'New here? Create an account'}</button><div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 text-center">
        <button
          type="button"
          onClick={handleDemoFill}
          className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 underline decoration-dotted"
        >
          Quick Fill Reviewer Demo (demo@pulse.app / demo123)
        </button>
      </div>
    </GlassCard>
  );
};

export default LoginForm;
