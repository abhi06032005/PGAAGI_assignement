import { RootState } from '@/store/store';

export const selectTrendingAll = (state: RootState) => state.feed.trendingAll;
export const selectTrendingForYou = (state: RootState) => state.feed.trendingForYou;
export const selectTrendingStatus = (state: RootState) => state.feed.trendingStatus;
