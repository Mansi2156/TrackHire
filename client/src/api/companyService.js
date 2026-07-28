import axiosInstance from "./axiosInstance";

export async function listCompaniesRequest(params = {}) {
  const { data } = await axiosInstance.get("/companies", { params });
  return data;
}

export async function getCompanyStatsOverviewRequest() {
  const { data } = await axiosInstance.get("/companies/stats");
  return data;
}

export async function getCompanyRequest(id) {
  const { data } = await axiosInstance.get(`/companies/${id}`);
  return data;
}

export async function getCompanyStatsRequest(id) {
  const { data } = await axiosInstance.get(`/companies/${id}/stats`);
  return data;
}

export async function listCompanyApplicationsRequest(id) {
  const { data } = await axiosInstance.get(`/companies/${id}/applications`);
  return data;
}

export async function createCompanyRequest(payload) {
  const { data } = await axiosInstance.post("/companies", payload);
  return data;
}

export async function updateCompanyRequest(id, payload) {
  const { data } = await axiosInstance.put(`/companies/${id}`, payload);
  return data;
}

export async function deleteCompanyRequest(id) {
  const { data } = await axiosInstance.delete(`/companies/${id}`);
  return data;
}