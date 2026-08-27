import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api";
import { courseCategoriesService, coursesService } from "@/services/courses.service";
import type { CourseCategoryPayload, CoursePayload, CourseType } from "@/types";

export function useCourses(
  page: number,
  pageSize: number,
  search = "",
  courseType?: CourseType,
) {
  return useQuery({
    queryKey: ["courses", page, pageSize, search, courseType],
    queryFn: () =>
      coursesService.list({
        page,
        page_size: pageSize,
        search: search || undefined,
        course_type: courseType,
      }),
    placeholderData: keepPreviousData,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CoursePayload) => coursesService.create(payload),
    onSuccess: (course) => {
      toast.success(`"${course.name}" created`);
      void qc.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Could not create course")),
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CoursePayload }) =>
      coursesService.update(id, payload),
    onSuccess: (course) => {
      toast.success(`"${course.name}" updated`);
      void qc.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Could not update course")),
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => coursesService.remove(id),
    onSuccess: () => {
      toast.success("Course deleted");
      void qc.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Could not delete course")),
  });
}

/* --------------------------------------------------------- course categories */

export function useCourseCategories(enabled = true) {
  return useQuery({
    queryKey: ["course-categories"],
    queryFn: () => courseCategoriesService.list({ page_size: 100 }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCourseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CourseCategoryPayload) => courseCategoriesService.create(payload),
    onSuccess: (cat) => {
      toast.success(`Category "${cat.name}" created`);
      void qc.invalidateQueries({ queryKey: ["course-categories"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Could not create category")),
  });
}

export function useUpdateCourseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CourseCategoryPayload }) =>
      courseCategoriesService.update(id, payload),
    onSuccess: (cat) => {
      toast.success(`Category "${cat.name}" updated`);
      void qc.invalidateQueries({ queryKey: ["course-categories"] });
      void qc.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Could not update category")),
  });
}

export function useDeleteCourseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => courseCategoriesService.remove(id),
    onSuccess: () => {
      toast.success("Category deleted");
      void qc.invalidateQueries({ queryKey: ["course-categories"] });
      void qc.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Could not delete category")),
  });
}
