import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  updateUserRole,
  deleteUser,
  updateProjectAllowedUsers,
} from "@/lib/api";
import type { UserRole } from "@/types";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateProjectPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      allowedUsers,
    }: {
      projectId: string;
      allowedUsers: string[];
    }) => updateProjectAllowedUsers(projectId, allowedUsers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
