"use client";
import { useDialog } from "@/components/modals/useDialog";
import React from "react";
import { PulseLeftSidebar } from "@/components/clone/PulseLeftSidebar";
import { PulseTopNav } from "@/components/clone/PulseTopNav";
import { StudioRail } from "@/components/dashboard/StudioRail";
import { ProfileModal } from "@/features/auth/ProfileModal";
import { SettingsPanel } from "@/features/preferences/SettingsPanel";
import { ItemDetailModal } from "@/components/modals/ItemDetailModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSettingsModalOpen } from "@/features/auth/authSlice";
import { useEventSource } from "@/features/realtime/useEventSource";
import { MotionConfig } from "framer-motion";
export function DashboardShell({ children }: { children?: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((s) => s.auth.isSettingsModalOpen);
  const profile = useAppSelector((s) => s.auth.isProfileModalOpen);
  const user = useAppSelector((s) => s.auth.user);
  const compact = useAppSelector((s) => s.preferences.compactMode);
  const { isConnected } = useEventSource();
  const settingsRef = useDialog(settings, () =>
    dispatch(setSettingsModalOpen(false)),
  );
  return (
    <MotionConfig reducedMotion="user">
      <div className={`studio ${compact ? "compact" : ""}`}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <PulseLeftSidebar />
        <div className="studio-workspace">
          <PulseTopNav />
          <div className="studio-columns">
            <main id="main-content">{children}</main>
            <StudioRail connected={isConnected} />
          </div>
          <footer className="studio-footer">
            PULSE — A SPACE FOR YOUR CURIOSITY{" "}
            <span>Thoughtfully curated. Always yours.</span>
          </footer>
        </div>
        {profile && <ProfileModal key={user.name} />}
        <ItemDetailModal />
        {settings && (
          <div
            ref={settingsRef}
            role="dialog"
            aria-modal="true"
            aria-label="Preferences"
            className="modal-backdrop"
            onKeyDown={(e) => {
              if (e.key === "Escape") dispatch(setSettingsModalOpen(false));
            }}
          >
            <SettingsPanel
              onClose={() => dispatch(setSettingsModalOpen(false))}
            />
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
export default DashboardShell;
