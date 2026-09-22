import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../lib/api';
import type { RangeKey } from '../lib/types';

export function useDashboard(range: RangeKey) {
  return useQuery({
    queryKey: ['dashboard', range],
    queryFn: () => fetchDashboard(range),
  });
}
