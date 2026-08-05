import axiosInstance from "./axiosInstance";

export async function updateProfileRequest({ fullName, jobTitle, location, bio }) {
  const { data } = await axiosInstance.put("/users/profile", {
    fullName,
    jobTitle,
    location,
    bio,
  });
  return data;
}

export async function changePasswordRequest({ currentPassword, newPassword }) {
  const { data } = await axiosInstance.put("/users/password", {
    currentPassword,
    newPassword,
  });
  return data;
}

export async function updateRemindersRequest({ interviewReminderDays, followUpReminderDays }) {
  const { data } = await axiosInstance.put("/users/reminders", {
    interviewReminderDays,
    followUpReminderDays,
  });
  return data;
}

export async function deleteAccountRequest() {
  const { data } = await axiosInstance.delete("/users/account");
  return data;
}
