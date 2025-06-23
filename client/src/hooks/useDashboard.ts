import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import type { DashboardFilters } from '@shared/types/models';

export function useDashboard(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', 'overview', filters],
    queryFn: () => dashboardApi.getOverview(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
} 