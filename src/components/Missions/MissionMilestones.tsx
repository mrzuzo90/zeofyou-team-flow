import { useState } from "react";
import { Check, Plus, Trash2, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useMilestones,
  useCreateMilestone,
  useToggleMilestone,
  useDeleteMilestone,
} from "@/hooks/useMilestones";

export function MissionMilestones({ missionId }: { missionId: string }) {
  const { data: milestones = [] } = useMilestones(missionId);
  const create = useCreateMilestone();
  const toggle = useToggleMilestone();
  const del = useDeleteMilestone();
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(milestones.length > 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await create.mutateAsync({ missionId, title: title.trim() });
    setTitle("");
    setOpen(true);
  };

  const total = milestones.length;
  const done = milestones.filter((m) => m.done).length;

  return (
    <div className="mt-3 rounded-lg border border-border/40 bg-muted/20 p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5" /> Hitos
          {total > 0 && <span className="text-foreground">{done}/{total}</span>}
        </span>
        <span className="text-[10px]">{open ? "Ocultar" : "Mostrar"}</span>
      </button>

      {open && (
        <div className="mt-2 space-y-1.5">
          {milestones.map((m) => (
            <div key={m.id} className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/40">
              <button
                onClick={() => toggle.mutate({ id: m.id, missionId, done: !m.done })}
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                  m.done ? "border-success bg-success text-success-foreground" : "border-border",
                )}
                aria-label={m.done ? "Marcar como pendiente" : "Marcar como hecho"}
              >
                {m.done && <Check className="h-3 w-3" />}
              </button>
              <span className={cn("flex-1 text-xs", m.done && "text-muted-foreground line-through")}>{m.title}</span>
              <button
                onClick={() => del.mutate({ id: m.id, missionId })}
                className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                aria-label="Eliminar hito"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <form onSubmit={submit} className="flex gap-1.5 pt-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Añadir hito…"
              className="h-7 text-xs"
            />
            <Button type="submit" size="sm" variant="ghost" className="h-7 px-2" aria-label="Añadir hito">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
