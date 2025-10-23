import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followupsService } from '@/services/followups';
import { FollowUp } from '@/types';
import { toast } from 'sonner';

export const useFollowups = (page: number = 1, limit: number = 10, filters?: any) => {
  return useQuery({
    queryKey: ['followups', page, limit, filters],
    queryFn: () => followupsService.getAll(page, limit, filters),
  });
};

export const useFollowupTasks = (status?: string) => {
  return useQuery({
    queryKey: ['followups', 'tasks', status],
    queryFn: () => followupsService.getTasks(status),
  });
};

export const useFollowup = (id: string) => {
  return useQuery({
    queryKey: ['followups', id],
    queryFn: () => followupsService.getById(id),
    enabled: !!id,
  });
};

export const useCreateFollowup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<FollowUp>) => followupsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      toast.success('Follow-up created successfully');
    },
    onError: () => {
      toast.error('Failed to create follow-up');
    },
  });
};

export const useUpdateFollowup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FollowUp> }) =>
      followupsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      toast.success('Follow-up updated successfully');
    },
    onError: () => {
      toast.error('Failed to update follow-up');
    },
  });
};

export const useCompleteFollowup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, outcome }: { id: string; outcome: string }) =>
      followupsService.complete(id, outcome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      toast.success('Follow-up completed successfully');
    },
    onError: () => {
      toast.error('Failed to complete follow-up');
    },
  });
};

export const useDeleteFollowup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => followupsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      toast.success('Follow-up deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete follow-up');
    },
  });
};
