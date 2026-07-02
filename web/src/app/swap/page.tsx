"use client";

import { useState } from "react";
import { SwapInterface } from "@/components/swap/SwapInterface";
import { SwapSettings, DEFAULT_SETTINGS, type SwapSettings as SwapSettingsType } from "@/components/swap/SwapSettings";

export default function SwapPage() {
  const [settings, setSettings] = useState<SwapSettingsType>(DEFAULT_SETTINGS);

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-obscura-primary">Private Swap</h1>
          <SwapSettings settings={settings} onChange={setSettings} />
        </div>
        <SwapInterface />
      </div>
    </main>
  );
}
