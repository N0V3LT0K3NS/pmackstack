import { useQuery } from '@tanstack/react-query';
import { storeApi } from '@/lib/api';

export function useStores(brand?: string) {
  return useQuery({
    queryKey: ['stores', brand],
    queryFn: () => storeApi.getStores(brand),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
} 