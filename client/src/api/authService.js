import axiosInstance from "./axiosInstance";

export async function registerRequest({ fullName, email, password }) {
  const { data } = await axiosInstance.post("/auth/register", {
    fullName,
    email,
    password,
  });
  return data;
}

export async function loginRequest({ email, password }) {
  const { data } = await axiosInstance.post("/auth/login", { email, password });
  return data;
}

export async function logoutRequest() {
  const { data } = await axiosInstance.post("/auth/logout");
  return data;
}

export async function getCurrentUserRequest() {
  const { data } = await axiosInstance.get("/auth/me");
  return data;
}
