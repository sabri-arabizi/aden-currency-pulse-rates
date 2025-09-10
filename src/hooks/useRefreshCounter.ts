import { useState, useCallback } from 'react';

export const useRefreshCounter = () => {
  const [refreshCount, setRefreshCount] = useState(0);

  const incrementRefresh = useCallback(() => {
    setRefreshCount(prev => prev + 1);
  }, []);

  const resetRefresh = useCallback(() => {
    setRefreshCount(0);
  }, []);

  return {
    refreshCount,
    incrementRefresh,
    resetRefresh
  };
};