'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setDebouncedQuery } from './searchSlice';

export function useDebouncedSearch(delay = 300) {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(setDebouncedQuery(searchTerm));
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay, dispatch]);

  return {
    searchTerm,
    setSearchTerm,
  };
}

export default useDebouncedSearch;
