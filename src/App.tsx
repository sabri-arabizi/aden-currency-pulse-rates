
import React, { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import UnityBanner from '@/components/UnityBanner';
import UnityInterstitial from '@/components/UnityInterstitial';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  const [showInterstitialTrigger, setShowInterstitialTrigger] = useState(false);

  useEffect(() => {
    // Consider app mount as "load complete"; show interstitial after 20s
    const timer = setTimeout(() => {
      setShowInterstitialTrigger(true);
    }, 20000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* Global banner shown on all pages after its internal delay (10s) */}
        <UnityBanner />
        {/* Global interstitial: shows once after 20s of app load completion */}
        <UnityInterstitial delaySeconds={20} trigger={showInterstitialTrigger} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/contact" element={<Contact />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
