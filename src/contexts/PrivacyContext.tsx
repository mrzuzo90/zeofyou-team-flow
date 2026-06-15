import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const Ctx = createContext<{ active: boolean; toggle: () => void; enable: () => void; disable: () => void } | undefined>(undefined);

export const PrivacyProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && e.shiftKey) setActive((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Ctx.Provider value={{ active, toggle: () => setActive((v) => !v), enable: () => setActive(true), disable: () => setActive(false) }}>
      {children}
    </Ctx.Provider>
  );
};

export const usePrivacy = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePrivacy must be used within PrivacyProvider");
  return c;
};
