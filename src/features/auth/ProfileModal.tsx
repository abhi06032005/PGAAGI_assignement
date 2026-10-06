'use client';

import { useDialog } from '@/components/modals/useDialog';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setProfileModalOpen } from './authSlice';
import { updateProfile } from './authThunks';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { SafeImage } from '@/components/ui/SafeImage';
import { X, User, Mail, FileText, Check } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.auth.isProfileModalOpen);
  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [saveError, setSaveError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const dialogRef=useDialog(isOpen,()=>dispatch(setProfileModalOpen(false)));
  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(updateProfile({ name, bio }));
    if (updateProfile.rejected.match(result)) { setSaveError(String(result.payload || 'Could not save profile')); return; }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      dispatch(setProfileModalOpen(false));
    }, 1200);
  };

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Edit profile" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <GlassCard className="relative w-full max-w-md p-6 border border-white/80 dark:border-stone-800 shadow-2xl">
        <button
          aria-label="Close profile"
          onClick={() => dispatch(setProfileModalOpen(false))}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-stone-200 dark:border-stone-700 shadow-sm flex-shrink-0">
            <SafeImage src={user.avatar} alt={user.name} fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">{user.name}</h3>
            <p className="text-xs text-stone-500">{user.handle} • {user.joinedDate}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {saveError && <p role="alert">{saveError}</p>}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                aria-label="Full Name"
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/70 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              Bio
            </label>
            <div className="relative">
              <FileText className="absolute top-2.5 left-3 w-4 h-4 text-stone-400 pointer-events-none" />
              <textarea
                aria-label="Bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/70 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => dispatch(setProfileModalOpen(false))}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="gap-1.5">
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default ProfileModal;
