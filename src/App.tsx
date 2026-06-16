import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivacyProvider } from "./contexts/PrivacyContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

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

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 30_000 } },
});

const protect = (el: JSX.Element) => <ProtectedRoute>{el}</ProtectedRoute>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <AuthProvider>
        <PrivacyProvider>
          <BrowserRouter>
            <Routes>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PrivacyProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
