import { useMutation } from "@tanstack/react-query";
import {
  changePasswordRequest,
  deleteAccountRequest,
  updateProfileRequest,
  updateRemindersRequest,
} from "../api/userService";

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: updateProfileRequest,
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: changePasswordRequest,
  });
}

export function useUpdateRemindersMutation() {
  return useMutation({
    mutationFn: updateRemindersRequest,
  });
}

export function useDeleteAccountMutation() {
  return useMutation({
    mutationFn: deleteAccountRequest,
  });
}
