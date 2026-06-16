import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivacy } from "@/contexts/PrivacyContext";

export const PrivacyShield = () => {
  const { active, disable } = usePrivacy();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const dayFmt = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-gradient-to-b from-slate-900 to-slate-950 px-8 py-16 text-slate-100"
          onClick={disable}
          onTouchStart={disable}
        >
          <div className="text-center text-sm uppercase tracking-widest text-slate-400">
            {dayFmt}
          </div>
          <div className="text-center">
            <div className="text-[8rem] font-light leading-none tracking-tight md:text-[12rem]">{hours}:{minutes}</div>
            <div className="mt-6 inline-flex items-center gap-3 text-lg text-slate-300">
              <span>☀</span>
              <span>21° · Despejado</span>
            </div>
          </div>
          <div className="text-xs text-slate-500">Toca para volver</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
