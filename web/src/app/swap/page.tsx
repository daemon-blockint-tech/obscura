"use client";

import { useState } from "react";
import { SwapInterface } from "@/components/swap/SwapInterface";
import { SwapSettings, DEFAULT_SETTINGS, type SwapSettings as SwapSettingsType } from "@/components/swap/SwapSettings";
import { ArrowsClockwise } from "@phosphor-icons/react";

export default function SwapPage() {
  const [settings, setSettings] = useState<SwapSettingsType>(DEFAULT_SETTINGS);

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-12">
      <div className="flex items-center gap-3 mb-10">
        <ArrowsClockwise size={24} weight="regular" className="text-obscura-primary" />
        <h1 className="text-2xl md:text-3xl tracking-tight font-bold text-obscura-on-surface">
          Private Swap
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div>
          <SwapInterface />
        </div>
        <div className="lg:sticky lg:top-20 lg:self-start">
          <SwapSettings settings={settings} onChange={setSettings} />
        </div>
      </div>
    </main>
  );
}
