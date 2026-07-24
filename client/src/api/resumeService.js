import axiosInstance from "./axiosInstance";

// Letting the browser set the multipart boundary itself (rather than the
// axios instance's default "Content-Type: application/json") is required
// for FormData uploads to be parsed correctly by multer on the server.
const MULTIPART_CONFIG = { headers: { "Content-Type": undefined } };

export async function listResumesRequest() {
  const { data } = await axiosInstance.get("/resumes");
  return data;
}

export async function getResumeStatsRequest() {
  const { data } = await axiosInstance.get("/resumes/stats");
  return data;
}

export async function getResumeRequest(id) {
  const { data } = await axiosInstance.get(`/resumes/${id}`);
  return data;
}

export async function uploadResumeRequest({ file, title }) {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);
  const { data } = await axiosInstance.post("/resumes", formData, MULTIPART_CONFIG);
  return data;
}

export async function renameResumeRequest(id, title) {
  const { data } = await axiosInstance.put(`/resumes/${id}`, { title });
  return data;
}

export async function replaceResumeRequest(id, file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosInstance.put(`/resumes/${id}/replace`, formData, MULTIPART_CONFIG);
  return data;
}

export async function deleteResumeRequest(id) {
  const { data } = await axiosInstance.delete(`/resumes/${id}`);
  return data;
}

export async function setDefaultResumeRequest(id) {
  const { data } = await axiosInstance.patch(`/resumes/${id}/default`);
  return data;
}

// Both download and preview fetch the file as a blob (rather than a plain
// <a href> / <iframe src>) so the JWT can be attached via the normal axios
// interceptor — the files are private per-user, not publicly served.
export async function fetchResumeBlob(id, { inline } = {}) {
  const path = inline ? `/resumes/${id}/preview` : `/resumes/${id}/download`;
  const response = await axiosInstance.get(path, { responseType: "blob" });
  return response.data;
}

export function triggerBrowserDownload(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}