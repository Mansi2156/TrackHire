import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteResumeRequest,
  getResumeStatsRequest,
  listResumesRequest,
  renameResumeRequest,
  replaceResumeRequest,
  setDefaultResumeRequest,
  updateResumeTagsRequest,
  uploadResumeRequest,
} from "../api/resumeService";

const RESUMES_KEY = "resumes";
const RESUME_STATS_KEY = "resume-stats";

export function useResumesQuery() {
  return useQuery({
    queryKey: [RESUMES_KEY],
    queryFn: listResumesRequest,
  });
}

export function useResumeStatsQuery() {
  return useQuery({
    queryKey: [RESUME_STATS_KEY],
    queryFn: getResumeStatsRequest,
  });
}

// Resume analytics (stats) and the default badge shown on cards both
// derive from the same underlying data, so every mutation invalidates both
// caches to keep the list and the stats row in sync automatically.
function useInvalidateResumes() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [RESUMES_KEY] });
    queryClient.invalidateQueries({ queryKey: [RESUME_STATS_KEY] });
  };
}

export function useUploadResumeMutation() {
  const invalidate = useInvalidateResumes();
  return useMutation({
    mutationFn: uploadResumeRequest,
    onSuccess: () => invalidate(),
  });
}

export function useRenameResumeMutation() {
  const invalidate = useInvalidateResumes();
  return useMutation({
    mutationFn: ({ id, title }) => renameResumeRequest(id, title),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateResumeTagsMutation() {
  const invalidate = useInvalidateResumes();
  return useMutation({
    mutationFn: ({ id, tags }) => updateResumeTagsRequest(id, tags),
    onSuccess: () => invalidate(),
  });
}

export function useReplaceResumeMutation() {
  const invalidate = useInvalidateResumes();
  return useMutation({
    mutationFn: ({ id, file }) => replaceResumeRequest(id, file),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteResumeMutation() {
  const invalidate = useInvalidateResumes();
  return useMutation({
    mutationFn: (id) => deleteResumeRequest(id),
    onSuccess: () => invalidate(),
  });
}

export function useSetDefaultResumeMutation() {
  const invalidate = useInvalidateResumes();
  return useMutation({
    mutationFn: (id) => setDefaultResumeRequest(id),
    onSuccess: () => invalidate(),
  });
}