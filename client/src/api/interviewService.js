import axiosInstance from "./axiosInstance";

export async function listInterviewsRequest(params = {}) {
  const { data } = await axiosInstance.get("/interviews", { params });
  return data;
}

export async function getInterviewStatsRequest() {
  const { data } = await axiosInstance.get("/interviews/stats");
  return data;
}

export async function listApplicationInterviewsRequest(applicationId) {
  const { data } = await axiosInstance.get(`/interviews/application/${applicationId}`);
  return data;
}

export async function getInterviewRequest(id) {
  const { data } = await axiosInstance.get(`/interviews/${id}`);
  return data;
}

export async function createInterviewRequest(payload) {
  const { data } = await axiosInstance.post("/interviews", payload);
  return data;
}

export async function updateInterviewRequest(id, payload) {
  const { data } = await axiosInstance.put(`/interviews/${id}`, payload);
  return data;
}

export async function deleteInterviewRequest(id) {
  const { data } = await axiosInstance.delete(`/interviews/${id}`);
  return data;
}

export async function updateInterviewStatusRequest(id, status) {
  const { data } = await axiosInstance.patch(`/interviews/${id}/status`, { status });
  return data;
}
