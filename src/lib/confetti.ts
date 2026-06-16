import confetti from "canvas-confetti";

export function celebrate() {
  const defaults = { spread: 70, ticks: 200, gravity: 0.9, scalar: 1, origin: { y: 0.7 } };
  const colors = ["#10b981", "#0ea5e9", "#a78bfa", "#fbbf24"];
  confetti({ ...defaults, particleCount: 60, startVelocity: 35, colors });
  setTimeout(() => confetti({ ...defaults, particleCount: 40, startVelocity: 25, colors, scalar: 0.8 }), 180);
}
