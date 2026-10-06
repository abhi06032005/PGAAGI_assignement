'use client';
import { FeedSection } from '@/features/feed/components/FeedSection';
import { DashboardIntro } from '@/components/dashboard/DashboardIntro';
import { NewItemsPill } from '@/features/realtime/NewItemsPill';
export default function DashboardFeedPage() { return <><DashboardIntro/><NewItemsPill/><FeedSection/></>; }
