import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCompanyRequest,
  deleteCompanyRequest,
  getCompanyRequest,
  getCompanyStatsOverviewRequest,
  getCompanyStatsRequest,
  listCompaniesRequest,
  listCompanyApplicationsRequest,
  updateCompanyRequest,
} from "../api/companyService";

const COMPANIES_KEY = "companies";
const COMPANY_STATS_KEY = "company-stats";

export function useCompaniesQuery(params) {
  return useQuery({
    queryKey: [COMPANIES_KEY, params],
    queryFn: () => listCompaniesRequest(params),
    keepPreviousData: true,
  });
}

export function useCompanyStatsOverviewQuery() {
  return useQuery({
    queryKey: [COMPANY_STATS_KEY, "overview"],
    queryFn: getCompanyStatsOverviewRequest,
  });
}

export function useCompanyQuery(id) {
  return useQuery({
    queryKey: [COMPANIES_KEY, id],
    queryFn: () => getCompanyRequest(id),
    enabled: Boolean(id),
  });
}

export function useCompanyStatsQuery(id) {
  return useQuery({
    queryKey: [COMPANY_STATS_KEY, id],
    queryFn: () => getCompanyStatsRequest(id),
    enabled: Boolean(id),
  });
}

export function useCompanyApplicationsQuery(id) {
  return useQuery({
    queryKey: [COMPANIES_KEY, id, "applications"],
    queryFn: () => listCompanyApplicationsRequest(id),
    enabled: Boolean(id),
  });
}

// Company stats and the overview cards both derive from the same
// underlying application data, so every mutation invalidates both caches
// (plus the applications list/stats, since deleting a company can change
// which applications count as "linked") to keep everything in sync.
function useInvalidateCompanies() {
  const queryClient = useQueryClient();
  return (id) => {
    queryClient.invalidateQueries({ queryKey: [COMPANIES_KEY] });
    queryClient.invalidateQueries({ queryKey: [COMPANY_STATS_KEY] });
    if (id) {
      queryClient.invalidateQueries({ queryKey: [COMPANIES_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [COMPANY_STATS_KEY, id] });
    }
  };
}

export function useCreateCompanyMutation() {
  const invalidate = useInvalidateCompanies();
  return useMutation({
    mutationFn: (payload) => createCompanyRequest(payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateCompanyMutation(id) {
  const invalidate = useInvalidateCompanies();
  return useMutation({
    mutationFn: (payload) => updateCompanyRequest(id, payload),
    onSuccess: () => invalidate(id),
  });
}

export function useDeleteCompanyMutation() {
  const invalidate = useInvalidateCompanies();
  return useMutation({
    mutationFn: (id) => deleteCompanyRequest(id),
    onSuccess: () => invalidate(),
  });
}