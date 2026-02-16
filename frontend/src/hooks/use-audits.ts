import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjectAudits,
  startAudit,
  getAudit,
  getAuditStatus,
  deleteAudit,
  confirmAuth,
} from "@/lib/api";

export function useProjectAudits(projectId: string) {
  return useQuery({
    queryKey: ["audits", "project", projectId],
    queryFn: () => getProjectAudits(projectId),
    enabled: !!projectId,
  });
}

export function useAudit(auditId: string) {
  return useQuery({
    queryKey: ["audits", auditId],
    queryFn: () => getAudit(auditId),
    enabled: !!auditId,
  });
}

export function useAuditStatus(auditId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["audits", auditId, "status"],
    queryFn: () => getAuditStatus(auditId),
    enabled: !!auditId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Continuer le polling tant que l'audit n'est pas terminé
      if (status === "pending" || status === "running" || status === "waiting-auth") {
        return 2000;
      }
      return false;
    },
  });
}

export function useStartAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => startAudit(projectId),
    onSuccess: (_data, projectId) => {
      queryClient.invalidateQueries({
        queryKey: ["audits", "project", projectId],
      });
    },
  });
}

export function useConfirmAuth() {
  return useMutation({
    mutationFn: (auditId: string) => confirmAuth(auditId),
  });
}

export function useDeleteAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (auditId: string) => deleteAudit(auditId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audits"] });
    },
  });
}
