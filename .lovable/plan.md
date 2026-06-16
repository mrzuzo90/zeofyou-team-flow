## Problema

La preview muestra pantalla en blanco con el error de Vite:

```
Failed to resolve import "framer-motion" from "src/components/UI/GlassCard.tsx"
Failed to resolve import "framer-motion" from "src/components/UI/PrivacyShield.tsx"
```

5 archivos usan `framer-motion` (`GlassCard`, `PrivacyShield`, `PageTransition`, `Dashboard`, `Onboarding`) pero el paquete no está en `package.json`. Probablemente se perdió en alguna instalación previa.

## Solución

1. Instalar la dependencia: `bun add framer-motion`
2. Verificar que la preview vuelve a cargar sin error de Vite.

No hace falta tocar ningún archivo de código: los imports ya están bien escritos.

## Fuera de alcance

- No cambiar componentes ni animaciones existentes.
- No tocar el onboarding ni la edge function (ya estaban funcionando antes del crash de build).
