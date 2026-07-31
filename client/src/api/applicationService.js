import axiosInstance from "./axiosInstance";

export async function listApplicationsRequest(params = {}) {
  const { data } = await axiosInstance.get("/applications", { params });
  return data;
}

export async function getApplicationRequest(id) {
  const { data } = await axiosInstance.get(`/applications/${id}`);
  return data;
}

export async function createApplicationRequest(payload) {
  const { data } = await axiosInstance.post("/applications", payload);
  return data;
}

export async function updateApplicationRequest(id, payload) {
  const { data } = await axiosInstance.put(`/applications/${id}`, payload);
  return data;
}

export async function deleteApplicationRequest(id) {
  const { data } = await axiosInstance.delete(`/applications/${id}`);
  return data;
}

export async function archiveApplicationRequest(id, archived) {
  const { data } = await axiosInstance.patch(`/applications/${id}/archive`, { archived });
  return data;
}

export async function bulkArchiveApplicationsRequest(ids, archived) {
  const { data } = await axiosInstance.post("/applications/bulk-archive", { ids, archived });
  return data;
}

export async function bulkDeleteApplicationsRequest(ids) {
  const { data } = await axiosInstance.post("/applications/bulk-delete", { ids });
  return data;
}

export async function updateApplicationStatusRequest(id, status) {
  const { data } = await axiosInstance.patch(`/applications/${id}/status`, { status });
  return data;
}
