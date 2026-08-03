import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api";
import { studentsService, type StudentListParams } from "@/services/students.service";
import type { ApiStudentPayload } from "@/types/leads-api";

export function useStudents(params: StudentListParams) {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () => studentsService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useStudent(id: number | null) {
  return useQuery({
    queryKey: ["student", id],
    queryFn: () => studentsService.get(id as number),
    enabled: id != null,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApiStudentPayload) => studentsService.create(payload),
    onSuccess: (s) => {
      toast.success(`Student ${s.student_id} created`);
      void qc.invalidateQueries({ queryKey: ["students"] });
      void qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Could not create student")),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ApiStudentPayload }) =>
      studentsService.update(id, payload),
    onSuccess: () => {
      toast.success("Student updated");
      void qc.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Could not update student")),
  });
}
