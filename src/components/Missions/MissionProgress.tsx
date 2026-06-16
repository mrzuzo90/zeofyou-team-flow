import { useState } from "react";
import { Clock, Target, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Mission, useUpdateMission, useLogMissionTime } from "@/hooks/useMissions";
import { MissionMilestones } from "./MissionMilestones";
import { cn } from "@/lib/utils";

const HORIZON_LABEL: Record<string, string> = {
  week: "Semana",
  month: "Mes",
  quarter: "Trimestre",
  year: "Año",
};

function formatHm(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function MissionProgress({ mission, compact = false }: { mission: Mission; compact?: boolean }) {
  const update = useUpdateMission();
  const logTime = useLogMissionTime();
  const [draft, setDraft] = useState<number | null>(null);

  if (mission.kind !== "long_term") return null;

  const value = draft ?? mission.progress;
  const target = mission.target_minutes ?? 0;
  const isManual = mission.progress_mode === "manual" && mission.status !== "completed";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          {mission.horizon && (
            <span className="rounded-full bg-secondary/15 px-2 py-0.5 font-semibold text-secondary">
              {HORIZON_LABEL[mission.horizon]}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {formatHm(mission.minutes_spent)}
            {target > 0 && <> / {formatHm(target)}</>}
          </span>
        </div>
        <span className="font-semibold text-foreground">{value}%</span>
      </div>

      <div className="relative h-2 overflow-hidden rounded-full bg-muted/40">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-aurora transition-[width] duration-700 ease-out"
          style={{ width: `${value}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full opacity-70 mix-blend-overlay"
          style={{
            width: `${value}%`,
            background:
              "linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.45) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "mission-shimmer 2.4s linear infinite",
          }}
        />
      </div>
      <style>{`@keyframes mission-shimmer { 0% { background-position: -100% 0; } 100% { background-position: 200% 0; } }`}</style>

      {!compact && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {isManual && (
            <div className="flex flex-1 items-center gap-2 min-w-[180px]">
              <Slider
                value={[value]}
                min={0}
                max={100}
                step={5}
                onValueChange={(v) => setDraft(v[0])}
                onValueCommit={(v) => {
                  setDraft(null);
                  update.mutate({ id: mission.id, patch: { progress: v[0] } });
                }}
                className={cn("flex-1")}
              />
            </div>
          )}
          {mission.status !== "completed" && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-[11px]"
                onClick={() => logTime.mutate({ missionId: mission.id, minutes: 15, identityId: mission.assigned_identity_id })}
              >
                <Plus className="h-3 w-3" /> 15m
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-[11px]"
                onClick={() => logTime.mutate({ missionId: mission.id, minutes: 60, identityId: mission.assigned_identity_id })}
              >
                <Plus className="h-3 w-3" /> 1h
              </Button>
            </>
          )}
          {mission.progress_mode === "time" && target > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Target className="h-3 w-3" /> Progreso por tiempo
            </span>
          )}
        </div>
      )}

      {!compact && <MissionMilestones missionId={mission.id} />}
    </div>
  );
}
