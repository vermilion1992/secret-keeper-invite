import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StrategyBuilder from "./pages/StrategyBuilder";
import BotCommunity from "./pages/BotCommunity";
import MyBots from "./pages/MyBots";
import AIChat from "./pages/AIChat";
import AppLayout from "./layouts/AppLayout";

const queryClient = new QueryClient();

import { ThemeProvider } from "next-themes";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/strategy-builder" element={<StrategyBuilder />} />
              <Route path="/strategy-builder/advanced" element={<StrategyBuilder />} />
              <Route path="/bot-community" element={<BotCommunity />} />
              <Route path="/my-bots" element={<MyBots />} />
              <Route path="/ai-chat" element={<AIChat />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
