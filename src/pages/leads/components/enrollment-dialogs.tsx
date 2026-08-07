import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCourses } from "@/hooks/use-courses";
import { useCourseBatches } from "@/hooks/use-batches";
import { useAddEnrollment, useAddPayment } from "@/hooks/use-leads";
import type {
  ApiEnrollmentPayload,
  ApiEnrollmentStatus,
  ApiPaymentMethod,
  ApiPaymentPayload,
  ApiPaymentStatus,
} from "@/types/leads-api";
import { toNepalIso } from "@/lib/leads-format";

const ENR_STATUS: ApiEnrollmentStatus[] = [
  "pending",
  "confirmed",
  "active",
  "completed",
  "cancelled",
  "dropped_out",
  "transferred",
];
const PAY_METHODS: ApiPaymentMethod[] = ["cash", "esewa", "khalti", "bank_transfer", "card", "connectips"];
const PAY_STATUS: ApiPaymentStatus[] = ["pending", "successful", "failed", "refunded", "voided"];

function num(a: string, b: string) {
  return String((Number(a || "0") - Number(b || "0") - 0).toFixed(2));
}

export function EnrollmentDialog({
  open,
  onClose,
  leadId,
  primaryCourseId,
}: {
  open: boolean;
  onClose: () => void;
  leadId?: number;
  primaryCourseId?: number | null;
}) {
  const [f, setF] = useState<ApiEnrollmentPayload>({});

  const coursesQ = useCourses(1, 100, "");
  const courses = useMemo(() => coursesQ.data?.results ?? [], [coursesQ.data]);
  const batchesQ = useCourseBatches(
    { course: f.course, page_size: 100, is_active: true },
    !!f.course,
  );
  const batches = useMemo(() => batchesQ.data?.results ?? [], [batchesQ.data]);
  const addEnrollment = useAddEnrollment(leadId);

  useEffect(() => {
    if (!open) return;
    setF({
      course: primaryCourseId ?? undefined,
      batch: undefined,
      enrollment_date: new Date().toISOString().slice(0, 10),
      status: "active",
      listed_fee: "0",
      standard_discount: "0",
      additional_discount: "0",
      agreed_amount: "0",
      remarks: "",
    });
  }, [open, primaryCourseId]);

  const set = <K extends keyof ApiEnrollmentPayload>(k: K, v: ApiEnrollmentPayload[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  // Keep agreed = listed - standard - additional as a helpful default.
  const agreedAuto = num(num(f.listed_fee ?? "0", f.standard_discount ?? "0"), f.additional_discount ?? "0");

  function submit() {
    if (!f.course) return;
    addEnrollment.mutate({ ...f, agreed_amount: f.agreed_amount || agreedAuto }, { onSuccess: () => onClose() });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create enrollment</DialogTitle>
          <DialogDescription>Record the course, batch, and agreed fee.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label required>Course</Label>
            <Select
              value={f.course != null ? String(f.course) : undefined}
              onValueChange={(v) =>
                setF((p) => ({
                  ...p,
                  course: Number(v),
                  batch: undefined,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Course Batch</Label>
            <Select
              value={f.batch != null ? String(f.batch) : undefined}
              onValueChange={(v) => {
                setF((p) => ({
                  ...p,
                  batch: Number(v),
                }));
              }}
              disabled={!f.course || batchesQ.isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={f.course ? "Select course batch" : "Select a course first"} />
              </SelectTrigger>
              <SelectContent>
                {batches.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.coursebatch_id} — {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Enrollment date</Label>
            <Input type="date" value={f.enrollment_date ?? ""} onChange={(e) => set("enrollment_date", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={f.status ?? "active"} onValueChange={(v) => set("status", v as ApiEnrollmentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENR_STATUS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Listed fee</Label>
            <Input type="number" value={f.listed_fee ?? ""} onChange={(e) => set("listed_fee", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Standard discount</Label>
            <Input type="number" value={f.standard_discount ?? ""} onChange={(e) => set("standard_discount", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Additional discount</Label>
            <Input type="number" value={f.additional_discount ?? ""} onChange={(e) => set("additional_discount", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Agreed amount</Label>
            <Input
              type="number"
              value={f.agreed_amount ?? ""}
              onChange={(e) => set("agreed_amount", e.target.value)}
              placeholder={agreedAuto}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Remarks</Label>
            <Textarea rows={2} value={f.remarks ?? ""} onChange={(e) => set("remarks", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" onClick={submit} disabled={addEnrollment.isPending}>
            {addEnrollment.isPending ? "Saving…" : "Create Enrollment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentDialog({
  open,
  onClose,
  leadId,
  enrollmentApiId,
}: {
  open: boolean;
  onClose: () => void;
  leadId?: number;
  enrollmentApiId?: number;
}) {
  const addPayment = useAddPayment(leadId, enrollmentApiId);
  const [f, setF] = useState<ApiPaymentPayload>({});
  useEffect(() => {
    if (!open) return;
    setF({
      amount: "",
      payment_date: new Date().toISOString(),
      payment_method: "esewa",
      status: "successful",
      transaction_reference: "",
      notes: "",
    });
  }, [open]);

  const set = <K extends keyof ApiPaymentPayload>(k: K, v: ApiPaymentPayload[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  function submit() {
    if (!f.amount) return;
    addPayment.mutate(f, { onSuccess: () => onClose() });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>Totals recalculate from successful payments.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label required>Amount</Label>
            <Input type="number" value={f.amount ?? ""} onChange={(e) => set("amount", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Date</Label>
            <Input
              type="datetime-local"
              value={f.payment_date ? f.payment_date.slice(0, 16) : ""}
              onChange={(e) => set("payment_date", toNepalIso(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Method</Label>
            <Select value={f.payment_method ?? "esewa"} onValueChange={(v) => set("payment_method", v as ApiPaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAY_METHODS.map((m) => (
                  <SelectItem key={m} value={m} className="capitalize">
                    {m.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={f.status ?? "successful"} onValueChange={(v) => set("status", v as ApiPaymentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAY_STATUS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Transaction reference</Label>
            <Input value={f.transaction_reference ?? ""} onChange={(e) => set("transaction_reference", e.target.value)} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={2} value={f.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" onClick={submit} disabled={addPayment.isPending}>
            {addPayment.isPending ? "Saving…" : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
