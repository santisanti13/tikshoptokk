import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProductResearch from "./pages/ProductResearch";
import ContenidoIA from "./pages/ContenidoIA";
import Productos from "./pages/Productos";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import MiCuenta from "./pages/MiCuenta";
import OAuthConsent from "./pages/OAuthConsent";
import UgcStudio from "./pages/UgcStudio";
import AdminTokens from "./pages/AdminTokens";
import AdminPulso from "./pages/AdminPulso";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/product-research" element={<ProductResearch />} />
          <Route path="/contenido-ia" element={<ContenidoIA />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route
            path="/ugc-studio"
            element={
              <RequireAuth>
                <UgcStudio />
              </RequireAuth>
            }
          />
          <Route
            path="/mi-cuenta"
            element={
              <RequireAuth>
                <MiCuenta />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/tokens"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <AdminTokens />
                </RequireAdmin>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/pulso"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <AdminPulso />
                </RequireAdmin>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
