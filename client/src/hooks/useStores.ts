import { useQuery } from '@tanstack/react-query';
import { storeApi } from '@/lib/api';

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: () => storeApi.getStores(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
} 