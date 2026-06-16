import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useIsTouch } from "@/hooks/useReducedMotion";

type CursorState = "default" | "magnet" | "view" | "play" | "text";

export function CustomCursor() {
  const reduced = useReducedMotion();
  const touch = useIsTouch();
  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>("default");
  const [label, setLabel] = useState<string>("");
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (reduced || touch) return;
    document.documentElement.classList.add("has-custom-cursor");
    const dot = dotRef.current!;
    const halo = haloRef.current!;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let hx = mx;
    let hy = my;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      setHidden(false);
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const mag = t.closest<HTMLElement>("[data-cursor]");
      if (mag) {
        setState((mag.dataset.cursor as CursorState) || "magnet");
        setLabel(mag.dataset.cursorLabel || "");
      } else if (t.closest("a, button, [role='button'], input, textarea, select, label")) {
        setState("magnet");
        setLabel("");
      } else {
        setState("default");
        setLabel("");
      }
    };

    const onLeave = () => setHidden(true);
    const onDown = () => dot.classList.add("is-down");
    const onUp = () => dot.classList.remove("is-down");

    const loop = () => {
      hx += (mx - hx) * 0.16;
      hy += (my - hy) * 0.16;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      halo.style.transform = `translate3d(${hx}px, ${hy}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [reduced, touch]);

  if (reduced || touch) return null;

  return (
    <>
      <div
        ref={haloRef}
        aria-hidden
        data-state={state}
        data-hidden={hidden}
        className="cursor-halo"
      >
        {label && <span className="cursor-label">{label}</span>}
      </div>
      <div ref={dotRef} aria-hidden data-state={state} data-hidden={hidden} className="cursor-dot" />
    </>
  );
}
