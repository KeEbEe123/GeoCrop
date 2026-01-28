import Header from "@/components/Header";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import CropMarketplace from "./pages/CropMarketplace";
import CropPrediction from "./pages/CropPrediction";
import FarmerDashboard from "./pages/FarmerDashboard";
import Home from "./pages/Home";
import MarketAnalytics from "./pages/MarketAnalytics";
import NotFound from "./pages/NotFound";
import OrderManagement from "./pages/OrderManagement";
import ProductMarketplace from "./pages/ProductMarketplace";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/crops" element={<CropMarketplace />} />
            <Route path="/products" element={<ProductMarketplace />} />
            <Route path="/prediction" element={<CropPrediction />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/dashboard" element={<FarmerDashboard />} />
            <Route path="/analytics" element={<MarketAnalytics />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
