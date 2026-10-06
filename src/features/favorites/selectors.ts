import { RootState } from '@/store/store';

export const selectFavoriteItems = (state: RootState) => state.favorites.favoriteItems;
export const selectFavoriteIds = (state: RootState) => state.favorites.favoriteIds;
export const selectIsFavorite = (id: string) => (state: RootState) =>
  state.favorites.favoriteIds.includes(id);
