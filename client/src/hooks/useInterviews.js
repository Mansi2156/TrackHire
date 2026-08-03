import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInterviewRequest,
  deleteInterviewRequest,
  getInterviewRequest,
  getInterviewStatsRequest,
  listApplicationInterviewsRequest,
  listInterviewsRequest,
  updateInterviewRequest,
  updateInterviewStatusRequest,
} from "../api/interviewService";

const INTERVIEWS_KEY = "interviews";
const INTERVIEW_STATS_KEY = "interview-stats";
const APPLICATION_INTERVIEWS_KEY = "application-interviews";

export function useInterviewsQuery(params) {
  return useQuery({
    queryKey: [INTERVIEWS_KEY, params],
    queryFn: () => listInterviewsRequest(params),
    keepPreviousData: true,
  });
}

export function useInterviewStatsQuery() {
  return useQuery({
    queryKey: [INTERVIEW_STATS_KEY],
    queryFn: getInterviewStatsRequest,
  });
}

export function useInterviewQuery(id) {
  return useQuery({
    queryKey: [INTERVIEWS_KEY, id],
    queryFn: () => getInterviewRequest(id),
    enabled: Boolean(id),
  });
}

// Sibling interviews for one application — powers both the Application
// Details "Interviews" section and the Interview Details "Round Progress"
// timeline / "Other interviews" list.
export function useApplicationInterviewsQuery(applicationId) {
  return useQuery({
    queryKey: [APPLICATION_INTERVIEWS_KEY, applicationId],
    queryFn: () => listApplicationInterviewsRequest(applicationId),
    enabled: Boolean(applicationId),
  });
}

// Every mutation invalidates the list, stats, and the per-application
// cache (the last one broadly, since we don't always know the affected
// applicationId ahead of time — e.g. on delete) — same conservative
// approach as useCompanies.js's useInvalidateCompanies.
function useInvalidateInterviews() {
  const queryClient = useQueryClient();
  return (id) => {
    queryClient.invalidateQueries({ queryKey: [INTERVIEWS_KEY] });
    queryClient.invalidateQueries({ queryKey: [INTERVIEW_STATS_KEY] });
    queryClient.invalidateQueries({ queryKey: [APPLICATION_INTERVIEWS_KEY] });
    if (id) {
      queryClient.invalidateQueries({ queryKey: [INTERVIEWS_KEY, id] });
    }
  };
}

export function useCreateInterviewMutation() {
  const invalidate = useInvalidateInterviews();
  return useMutation({
    mutationFn: (payload) => createInterviewRequest(payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateInterviewMutation(id) {
  const invalidate = useInvalidateInterviews();
  return useMutation({
    mutationFn: (payload) => updateInterviewRequest(id, payload),
    onSuccess: () => invalidate(id),
  });
}

export function useDeleteInterviewMutation() {
  const invalidate = useInvalidateInterviews();
  return useMutation({
    mutationFn: (id) => deleteInterviewRequest(id),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateInterviewStatusMutation() {
  const invalidate = useInvalidateInterviews();
  return useMutation({
    mutationFn: ({ id, status }) => updateInterviewStatusRequest(id, status),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}
