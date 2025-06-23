import { useQuery } from '@tanstack/react-query';
import type { TimeSeriesDataPoint } from '@shared/types/models';

interface StoreTimeSeriesResponse {
  success: boolean;
  data: { [storeCode: string]: TimeSeriesDataPoint[] };
}

export function useStoreTimeSeries(
  startDate?: string,
  endDate?: string,
  stores?: string[]
) {
  return useQuery<{ [storeCode: string]: TimeSeriesDataPoint[] }>({
    queryKey: ['stores-timeseries', startDate, endDate, stores],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (stores?.length) params.append('stores', stores.join(','));

      const response = await fetch(`/api/dashboard/stores-timeseries?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch store time series data');
      }
      
      const result: StoreTimeSeriesResponse = await response.json();
      return result.data;
    },
    enabled: Boolean(startDate && endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
} 