## Diagnóstico del bug de Google

Los logs de auth muestran que el login con Google **sí completa con status 200** y la sesión se establece. El problema está en el frontend: tras `lovable.auth.signInWithOAuth("google", ...)` en `Login.tsx`, cuando el flujo termina en modo popup (no redirected), el handler no hace `navigate("/")`, así que el usuario se queda atascado en `/login` aunque ya esté autenticado. Además, si un usuario ya logueado abre `/login` o `/signup`, tampoco se le redirige.

## Plan

### 1. Arreglar el login con Google
- En `Login.tsx` y `Signup.tsx`: tras `signInWithOAuth`, si no hay `error` y no hay `redirected`, llamar `navigate("/", { replace: true })`. Mantener `setLoading(false)` siempre.
- En `AuthProvider`: cuando `onAuthStateChange` dispare `SIGNED_IN` y la ruta actual sea `/login` o `/signup`, no hacer nada en el provider (lo gestiona la página), pero exponer un efecto en `Login`/`Signup` que, si `user` ya existe, redirija a `/`.
- Añadir manejo de error visible (toast) si `result.error` viene del gateway.

### 2. Crear usuario de prueba
- Migration que inserte (vía `auth.admin` no es posible desde SQL) → en su lugar: crear un seed usando `supabase--insert` directo a `auth.users` no es seguro. **Alternativa**: documentar credenciales y crear cuenta vía signup programático en una pequeña edge function `seed-demo-user` invocable una sola vez, o simplemente registrar las credenciales:
  - Email: `demo@zeofyou.app`
  - Password: `Demo1234!`
  - Se creará llamando a `supabase.auth.signUp` desde un script de un solo uso (botón oculto en `/login` "Entrar como demo" que hace signUp+signIn la primera vez, después solo signIn). Esto evita tocar `auth` schema.

### 3. Mejoras adicionales (UX/funcionalidad)
- **Redirect-if-authed** en `Login`/`Signup` (evita loops).
- **Loader global** mientras `AuthProvider` carga (ya existe en ProtectedRoute, replicar para rutas públicas para evitar flash de /login).
- **Onboarding automático**: si el perfil del usuario no tiene `onboarding_completed=true`, redirigir a `/bienvenida` después del login. (Requiere campo nuevo en `profiles`.)
- **Migración**: añadir columna `onboarding_completed boolean default false` a `profiles`.
- **Botón "Entrar como demo"** en pantalla de login para acceso rápido al usuario de prueba.
- **Toast informativo** en errores OAuth con mensaje real.

### Archivos a tocar
- `src/pages/Login.tsx`, `src/pages/Signup.tsx`: navegación post-OAuth + redirect-if-authed + botón demo.
- `src/contexts/AuthContext.tsx`: exponer helper `signInDemo()`.
- `src/components/Auth/ProtectedRoute.tsx`: leer `profile.onboarding_completed` y redirigir a `/bienvenida` si falta.
- `src/hooks/useProfile.ts`: incluir `onboarding_completed`.
- `src/pages/Onboarding.tsx`: al finalizar, marcar `onboarding_completed=true`.
- **Migración**: `ALTER TABLE profiles ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;`

### Fuera de alcance (lo confirmas si quieres)
- Edge functions de IA (`daily-recommendations`, `weekly-insights`) — pendiente del mensaje anterior.
- Sistema de logros automáticos.

¿Procedo con este plan?