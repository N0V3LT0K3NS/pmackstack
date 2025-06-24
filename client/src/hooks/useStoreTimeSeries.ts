import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
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

      const response = await api.get(`/dashboard/stores-timeseries?${params}`);
      return response.data.data;
    },
    enabled: Boolean(startDate && endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
} 