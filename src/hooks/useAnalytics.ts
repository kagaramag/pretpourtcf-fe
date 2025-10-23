import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';
import { ReportFilter } from '@/types';
import { toast } from 'sonner';
import { downloadFile, generateReportFilename } from '@/lib/utils';

export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsService.getOverview,
  });
};

export const useAgentAnalytics = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['analytics', 'agents', filters],
    queryFn: () => analyticsService.getByAgent(filters),
  });
};

export const useClientAnalytics = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['analytics', 'clients', filters],
    queryFn: () => analyticsService.getByClient(filters),
  });
};

export const useDateAnalytics = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['analytics', 'dates', filters],
    queryFn: () => analyticsService.getByDate(filters),
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: ({ format, filters }: { format: 'csv' | 'excel' | 'pdf'; filters?: ReportFilter }) =>
      analyticsService.exportReport(format, filters),
    onSuccess: (blob, variables) => {
      const filename = generateReportFilename('analytics', variables.format);
      downloadFile(blob, filename);
      toast.success('Report exported successfully');
    },
    onError: () => {
      toast.error('Failed to export report');
    },
  });
};
