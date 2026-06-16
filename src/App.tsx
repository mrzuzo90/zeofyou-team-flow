import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivacyProvider } from "./contexts/PrivacyContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { SmoothScroll } from "./components/Motion/SmoothScroll";
import { CustomCursor } from "./components/Motion/CustomCursor";
import { IntroLoader } from "./components/Motion/IntroLoader";

import Dashboard from "./pages/Dashboard";
import Identities from "./pages/Identities";
import Missions from "./pages/Missions";
import Focus from "./pages/Focus";
import Planning from "./pages/Planning";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import Transition from "./pages/Transition";
import HandsFree from "./pages/HandsFree";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 30_000 } },
});

const protect = (el: JSX.Element) => <ProtectedRoute>{el}</ProtectedRoute>;

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/bienvenida" element={protect(<Onboarding />)} />
          <Route path="/" element={protect(<Dashboard />)} />
          <Route path="/identidades" element={protect(<Identities />)} />
          <Route path="/proyectos" element={protect(<Missions />)} />
          <Route path="/enfoque" element={protect(<Focus />)} />
          <Route path="/planificacion" element={protect(<Planning />)} />
          <Route path="/insights" element={protect(<Insights />)} />
          <Route path="/perfil" element={protect(<Profile />)} />
          <Route path="/transicion" element={protect(<Transition />)} />
          <Route path="/manos-libres" element={protect(<HandsFree />)} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <AuthProvider>
        <PrivacyProvider>
          <BrowserRouter>
            <SmoothScroll>
              <IntroLoader />
              <CustomCursor />
              <AnimatedRoutes />
            </SmoothScroll>
          </BrowserRouter>
        </PrivacyProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
