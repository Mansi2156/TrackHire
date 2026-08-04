import axiosInstance from "./axiosInstance";

export async function getDashboardOverviewRequest() {
  const { data } = await axiosInstance.get("/dashboard/overview");
  return data;
}