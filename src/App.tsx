
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
import { Capacitor } from '@capacitor/core';
import UnityNative from '@/lib/capacitorUnityAds';
import { UNITY_GAME_ID_ANDROID } from '@/lib/unityAds';

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

  const [isAdInitialized, setIsAdInitialized] = useState(false);

  useEffect(() => {
    console.log('🚀 App Mounted: Unity Ads Logic Loaded (v2)');
    const initTimer = setTimeout(async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          console.log('⏰ 20s passed: Initializing Unity Ads...');
          await UnityNative.initialize(UNITY_GAME_ID_ANDROID, true);
          console.log('✅ Unity Ads initialized successfully');
          setIsAdInitialized(true);
        } catch (error) {
          console.error('❌ Error initializing Unity Ads:', error);
        }
      }
    }, 20000); // 20 seconds delay

    return () => clearTimeout(initTimer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* Global banner shown on all pages after its internal delay (10s) */}
        {/* Global banner shown after initialization */}
        <UnityBanner isInitialized={isAdInitialized} />
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
