import type { ModeKey } from "@/lib/modes";

type Action = { text: string; energy: "low" | "mid" | "high" };

const ACTIONS: Record<ModeKey, Action[]> = {
  work: [
    { text: "Vacía la bandeja de entrada con archivar/responder/snooze.", energy: "low" },
    { text: "Escribe el asunto del email difícil que llevas evitando.", energy: "low" },
    { text: "Bloquea 25 min de focus para tu misión principal.", energy: "high" },
    { text: "Apunta los 3 próximos pasos concretos de tu proyecto activo.", energy: "mid" },
    { text: "Cancela o delega una reunión que no aporta.", energy: "high" },
  ],
  home: [
    { text: "Recoge una superficie visible (mesa, cocina, sofá).", energy: "low" },
    { text: "Pon música y prepara una infusión, sin pantalla 5 min.", energy: "low" },
    { text: "Camina 5 minutos por casa o al exterior.", energy: "mid" },
    { text: "Apaga notificaciones de trabajo hasta mañana.", energy: "low" },
    { text: "Estira cuello y hombros 2 minutos.", energy: "low" },
  ],
  family: [
    { text: "Pregunta a alguien cercano cómo le ha ido el día y escucha sin móvil.", energy: "low" },
    { text: "Envía un mensaje cariñoso a alguien importante.", energy: "low" },
    { text: "Propón un plan corto para mañana con la familia.", energy: "mid" },
    { text: "Deja el móvil en otra habitación durante la próxima conversación.", energy: "low" },
  ],
  travel: [
    { text: "Revisa la siguiente parada del viaje.", energy: "low" },
    { text: "Hidrátate y come algo ligero.", energy: "low" },
    { text: "Anota una idea o foto del momento.", energy: "low" },
    { text: "Mira por la ventana 2 minutos sin pantalla.", energy: "low" },
  ],
  none: [
    { text: "Define qué modo quieres activar ahora mismo.", energy: "low" },
    { text: "Elige tu misión principal del día.", energy: "mid" },
  ],
};

export function pickMicroAction(mode: ModeKey, energyLevel?: number, seed = Date.now()): Action {
  const pool = ACTIONS[mode] ?? ACTIONS.none;
  const bucket =
    energyLevel == null ? pool :
    energyLevel <= 2 ? pool.filter((a) => a.energy === "low") :
    energyLevel >= 4 ? pool.filter((a) => a.energy !== "low") :
    pool;
  const list = bucket.length ? bucket : pool;
  return list[seed % list.length];
}
