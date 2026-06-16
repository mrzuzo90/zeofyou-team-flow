import { IdentityAvatar } from "@/components/UI/IdentityAvatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { SuggestedIdentity, SuggestedMission } from "@/hooks/useOnboarding";

export const IdentitySuggestionCard = ({
  identity, onChange, onRemove,
}: { identity: SuggestedIdentity; onChange: (patch: Partial<SuggestedIdentity>) => void; onRemove: () => void }) => (
  <div className="relative flex gap-3 rounded-xl border border-border bg-card/60 p-3">
    <button onClick={onRemove} className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive" aria-label="Quitar">
      <X className="h-3.5 w-3.5" />
    </button>
    <IdentityAvatar name={identity.name} color={identity.color} size="md" />
    <div className="flex-1 space-y-1.5 pr-6">
      <Input value={identity.name} onChange={(e) => onChange({ name: e.target.value })} className="h-8 font-display font-semibold" />
      <div className="text-xs text-muted-foreground">{identity.role} · {identity.specialty}</div>
      <p className="text-sm">{identity.description}</p>
    </div>
  </div>
);

export const MissionSuggestionCard = ({
  mission, primary, onChange, onRemove,
}: { mission: SuggestedMission; primary?: boolean; onChange: (patch: Partial<SuggestedMission>) => void; onRemove?: () => void }) => (
  <div className="relative rounded-xl border border-border bg-card/60 p-3">
    {onRemove && (
      <button onClick={onRemove} className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive" aria-label="Quitar">
        <X className="h-3.5 w-3.5" />
      </button>
    )}
    <div className="mb-2 flex flex-wrap items-center gap-2">
      {primary && <Badge className="bg-gradient-emerald text-primary-foreground">Misión principal</Badge>}
      <Badge variant="outline">{mission.category}</Badge>
      <Badge variant="outline">{mission.priority}</Badge>
      <span className="text-xs text-muted-foreground">+{mission.xp_reward} XP</span>
    </div>
    <Input value={mission.title} onChange={(e) => onChange({ title: e.target.value })} className="h-9 font-display font-semibold" />
    <p className="mt-1.5 text-sm text-muted-foreground">{mission.description}</p>
  </div>
);
