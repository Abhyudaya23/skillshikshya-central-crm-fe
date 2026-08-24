import { useEffect, useState } from "react";
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
import { CALL_OUTCOMES } from "@/data/lead-lookups";
import { useUpdateCall } from "@/hooks/use-leads";
import { toNepalIso } from "@/lib/leads-format";
import type { Activity } from "@/types/leads";

interface EditCallForm {
  outcome: string;
  notes: string;
  recording: string;
  nextFollowUp: string;
  nextAction: string;
}

/** ISO → value for <input type="datetime-local"> (local time). */
function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * Edit a logged call — outcome, notes, recording link, and next steps.
 * Backend: PATCH /api/leads/{id}/calls/{callId}/ (duration & caller are locked).
 */
export function EditCallDialog({
  leadId,
  call,
  onClose,
}: {
  leadId: number;
  call: Activity | null;
  onClose: () => void;
}) {
  const updateCall = useUpdateCall(leadId);
  const [form, setForm] = useState<EditCallForm>({
    outcome: "",
    notes: "",
    recording: "",
    nextFollowUp: "",
    nextAction: "",
  });

  // Re-seed the form whenever a different call is opened.
  useEffect(() => {
    if (call) {
      setForm({
        outcome: call.outcome ?? "",
        notes: call.notes ?? "",
        recording: call.recordingUrl ?? "",
        nextFollowUp: isoToLocalInput(call.followUpAt),
        nextAction: call.nextAction ?? "",
      });
    }
  }, [call]);

  const set = <K extends keyof EditCallForm>(k: K, v: EditCallForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function submit() {
    if (!call?.apiCallId) return;
    updateCall.mutate(
      {
        callId: call.apiCallId,
        payload: {
          outcome: form.outcome || null,
          notes: form.notes.trim() || null,
          recording_url: form.recording.trim() || null,
          next_followup_at: form.nextFollowUp ? toNepalIso(form.nextFollowUp) : null,
          next_action: form.nextAction.trim() || null,
        },
      },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <Dialog open={call != null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit call — {call?.performedBy}</DialogTitle>
          <DialogDescription>
            Update the outcome or follow-up plan. Call duration and direction are locked after
            logging.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Outcome</Label>
            <Select value={form.outcome} onValueChange={(v) => set("outcome", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                {CALL_OUTCOMES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              placeholder="What did the caller say?"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Next follow-up</Label>
              <Input
                type="datetime-local"
                value={form.nextFollowUp}
                onChange={(e) => set("nextFollowUp", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Recording link</Label>
              <Input
                placeholder="Optional URL"
                value={form.recording}
                onChange={(e) => set("recording", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Next action</Label>
            <Input
              placeholder="e.g. Send fee plan on WhatsApp"
              value={form.nextAction}
              onChange={(e) => set("nextAction", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateCall.isPending}>
            Cancel
          </Button>
          <Button variant="brand" onClick={submit} disabled={updateCall.isPending}>
            {updateCall.isPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
