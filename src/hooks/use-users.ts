import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { usersService } from "@/services/users.service";
import type { RegisterPayload, UpdateUserPayload } from "@/types";

export function useUsers(page: number, pageSize: number) {
  return useQuery({
    queryKey: ["users", page, pageSize],
    queryFn: () => usersService.list({ page, page_size: pageSize }),
    placeholderData: keepPreviousData,
  });
}

export function useRegisterUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      toast.success(`${data.user.name} registered`);
      void qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Registration failed")),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      usersService.update(id, payload),
    onSuccess: (user) => {
      toast.success(`${user.name} updated`);
      void qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Update failed")),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersService.remove(id),
    onSuccess: () => {
      toast.success("User deleted");
      void qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Delete failed")),
  });
}
