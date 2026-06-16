import { useEffect, useRef } from "react";
import { useReducedMotion, useIsTouch } from "@/hooks/useReducedMotion";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  uniform vec3 uBg;
  uniform float uMix;

  // 2D simplex noise — Ashima
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
            + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv * 2.0 - 1.0;
    float t = uTime * 0.07;

    float n1 = snoise(p * 1.4 + vec2(t, -t * 0.6));
    float n2 = snoise(p * 2.2 + vec2(-t * 0.4, t * 0.8) + n1 * 0.6);
    float n3 = snoise(p * 0.8 - vec2(t * 0.3, -t * 0.2));

    float dM = distance(uv, uMouse);
    float mouseGlow = smoothstep(0.5, 0.0, dM) * 0.25;

    float wA = smoothstep(-0.4, 0.8, n1) * 0.85;
    float wB = smoothstep(-0.6, 0.7, n2 + 0.2) * 0.7;
    float wC = smoothstep(-0.3, 0.9, n3) * 0.5;

    vec3 col = uA * wA + uB * wB + uC * wC;
    col += uA * mouseGlow;

    // Vignette suave (más ligera en claro)
    vec2 q = uv - 0.5;
    float vig = 1.0 - dot(q, q) * 1.4;
    col *= mix(1.0, vig, step(0.5, 1.0 - uBg.r));

    // Mezcla con fondo del tema activo
    col = mix(uBg, col, uMix);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function AuroraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const touch = useIsTouch();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn("Shader compile failed", gl.getShaderInfoLog(s));
      }
      return s;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);

    const verts = new Float32Array([-1, -1, 3, -1, -1, 3]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uA = gl.getUniformLocation(program, "uA");
    const uB = gl.getUniformLocation(program, "uB");
    const uC = gl.getUniformLocation(program, "uC");
    const uBg = gl.getUniformLocation(program, "uBg");
    const uMix = gl.getUniformLocation(program, "uMix");

    // Paleta aurora — violeta / verde / azul
    gl.uniform3f(uA, 0.658, 0.545, 0.980); // #a78bfa
    gl.uniform3f(uB, 0.290, 0.870, 0.502); // #4ade80
    gl.uniform3f(uC, 0.231, 0.510, 0.965); // #3b82f6

    const applyTheme = () => {
      const light = document.documentElement.dataset.theme === "light";
      if (light) {
        gl.uniform3f(uBg, 1.0, 1.0, 1.0);
        gl.uniform1f(uMix, 0.12);
        canvas.style.opacity = "0.22";
        canvas.style.mixBlendMode = "screen";
      } else {
        gl.uniform3f(uBg, 0.06, 0.065, 0.10);
        gl.uniform1f(uMix, 0.55);
        canvas.style.opacity = "0.9";
        canvas.style.mixBlendMode = "normal";
      }
    };
    applyTheme();
    const themeObs = new MutationObserver(applyTheme);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-mode"] });

    let mx = 0.5, my = 0.5;
    let tmx = 0.5, tmy = 0.5;
    const onMove = (e: MouseEvent) => {
      tmx = e.clientX / window.innerWidth;
      tmy = 1 - e.clientY / window.innerHeight;
    };
    if (!touch) window.addEventListener("mousemove", onMove);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let rafId = 0;
    let running = true;
    const start = performance.now();
    const render = () => {
      if (!running) return;
      mx += (tmx - mx) * 0.04;
      my += (tmy - my) * 0.04;
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafId = requestAnimationFrame(render);
    };
    const onVis = () => {
      running = !document.hidden;
      if (running) rafId = requestAnimationFrame(render);
      else cancelAnimationFrame(rafId);
    };
    document.addEventListener("visibilitychange", onVis);
    rafId = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      themeObs.disconnect();
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
    };
  }, [reduced, touch]);

  if (reduced) {
    return <div className="aurora-bg" aria-hidden />;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
