import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

export const AmbitionsInput = ({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) => {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v || value.includes(v) || value.length >= 5) return;
    onChange([...value, v]);
    setDraft("");
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ej. Lanzar mi propio negocio"
          maxLength={80}
        />
        <button
          type="button"
          onClick={add}
          className="rounded-md border border-border bg-card px-3 text-sm hover:bg-accent"
          aria-label="Añadir ambición"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((a, i) => (
            <Badge key={i} variant="secondary" className="gap-1 py-1 pl-3 pr-1">
              {a}
              <button onClick={() => remove(i)} className="rounded p-0.5 hover:bg-destructive/20" aria-label={`Quitar ${a}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Pulsa Enter para añadir (1-5 ambiciones).</p>
    </div>
  );
};
