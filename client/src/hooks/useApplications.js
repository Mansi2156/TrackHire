import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  archiveApplicationRequest,
  bulkArchiveApplicationsRequest,
  bulkDeleteApplicationsRequest,
  createApplicationRequest,
  deleteApplicationRequest,
  getApplicationRequest,
  listApplicationsRequest,
  updateApplicationRequest,
  updateApplicationStatusRequest,
} from "../api/applicationService";

const APPLICATIONS_KEY = "applications";

export function useApplicationsQuery(params) {
  return useQuery({
    queryKey: [APPLICATIONS_KEY, params],
    queryFn: () => listApplicationsRequest(params),
    keepPreviousData: true,
  });
}

export function useApplicationQuery(id) {
  return useQuery({
    queryKey: [APPLICATIONS_KEY, id],
    queryFn: () => getApplicationRequest(id),
    enabled: Boolean(id),
  });
}

function useInvalidateApplications() {
  const queryClient = useQueryClient();
  return (id) => {
    queryClient.invalidateQueries({ queryKey: [APPLICATIONS_KEY] });
    if (id) {
      queryClient.invalidateQueries({ queryKey: [APPLICATIONS_KEY, id] });
    }
  };
}

export function useCreateApplicationMutation() {
  const invalidate = useInvalidateApplications();
  return useMutation({
    mutationFn: (payload) => createApplicationRequest(payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateApplicationMutation(id) {
  const invalidate = useInvalidateApplications();
  return useMutation({
    mutationFn: (payload) => updateApplicationRequest(id, payload),
    onSuccess: () => invalidate(id),
  });
}

export function useDeleteApplicationMutation() {
  const invalidate = useInvalidateApplications();
  return useMutation({
    mutationFn: (id) => deleteApplicationRequest(id),
    onSuccess: () => invalidate(),
  });
}

export function useArchiveApplicationMutation() {
  const invalidate = useInvalidateApplications();
  return useMutation({
    mutationFn: ({ id, archived }) => archiveApplicationRequest(id, archived),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}

export function useBulkArchiveApplicationsMutation() {
  const invalidate = useInvalidateApplications();
  return useMutation({
    mutationFn: ({ ids, archived }) => bulkArchiveApplicationsRequest(ids, archived),
    onSuccess: () => invalidate(),
  });
}

export function useBulkDeleteApplicationsMutation() {
  const invalidate = useInvalidateApplications();
  return useMutation({
    mutationFn: (ids) => bulkDeleteApplicationsRequest(ids),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateApplicationStatusMutation() {
  const invalidate = useInvalidateApplications();
  return useMutation({
    mutationFn: ({ id, status }) => updateApplicationStatusRequest(id, status),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}
