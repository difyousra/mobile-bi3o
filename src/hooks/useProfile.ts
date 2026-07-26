import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import * as profileService from "../services/profileService";
import * as authService from "../services/authService";
import type { LocalPhoto } from "../types/publish";
import type { User } from "../types/auth";

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const result = await authService.getMe();
      if (!result.ok) throw new Error(result.message ?? "Profil inaccessible");
      return result.data as User;
    },
    staleTime: 60_000,
  });
}

export function useProfileMe() {
  return useQuery({
    queryKey: queryKeys.profileMe,
    queryFn: () => profileService.fetchProfileMe(),
    staleTime: 60_000,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: profileService.ChangePasswordRequest) =>
      profileService.changePassword(body),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photo: LocalPhoto) => profileService.uploadAvatar(photo),
    onSettled: async () => {
      const me = await authService.getMe();
      if (me.ok) {
        qc.setQueryData(queryKeys.me, me.data);
      }
      qc.invalidateQueries({ queryKey: queryKeys.me });
      qc.invalidateQueries({ queryKey: queryKeys.profileMe });
    },
  });
}
