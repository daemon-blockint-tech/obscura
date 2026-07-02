"use client";

import { GearFine } from "@phosphor-icons/react";

export interface SwapSettings {
  slippageBps: number;
  priorityLevel: "Low" | "Medium" | "High";
  useHeliusSender: boolean;
  tipLamports: number;
}

const DEFAULT_SETTINGS: SwapSettings = {
  slippageBps: 50,
  priorityLevel: "High",
  useHeliusSender: true,
  tipLamports: 1_000_000,
};

export function SwapSettings({ settings, onChange }: {
  settings: SwapSettings;
  onChange: (s: SwapSettings) => void;
}) {
  return (
    <div className="rounded-xl bg-obscura-surface border border-obscura-surface-variant overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-obscura-surface-variant">
        <GearFine size={16} weight="regular" className="text-obscura-on-surface-variant" />
        <h2 className="text-sm font-semibold text-obscura-on-surface tracking-tight">Swap Settings</h2>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-obscura-on-surface-variant">
            Slippage: {(settings.slippageBps / 100).toFixed(1)}%
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[10, 50, 100, 300].map((bps) => (
              <button
                key={bps}
                onClick={() => onChange({ ...settings, slippageBps: bps })}
                className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-all active:scale-[0.98] ${
                  settings.slippageBps === bps
                    ? "bg-obscura-primary text-obscura-dark"
                    : "bg-obscura-dark text-obscura-on-surface-variant border border-obscura-surface-variant hover:text-obscura-on-surface"
                }`}
              >
                {(bps / 100).toFixed(1)}%
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-obscura-on-surface-variant">Priority Fee Level</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(["Low", "Medium", "High"] as const).map((level) => (
              <button
                key={level}
                onClick={() => onChange({ ...settings, priorityLevel: level })}
                className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-all active:scale-[0.98] ${
                  settings.priorityLevel === level
                    ? "bg-obscura-primary text-obscura-dark"
                    : "bg-obscura-dark text-obscura-on-surface-variant border border-obscura-surface-variant hover:text-obscura-on-surface"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-obscura-on-surface">Helius Sender</span>
            <span className="text-[10px] text-obscura-on-surface-variant">Fast transaction landing</span>
          </div>
          <button
            onClick={() => onChange({ ...settings, useHeliusSender: !settings.useHeliusSender })}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              settings.useHeliusSender ? "bg-obscura-primary" : "bg-obscura-surface-variant"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.useHeliusSender ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {settings.useHeliusSender && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-obscura-on-surface-variant">
              Tip: {settings.tipLamports / 1_000_000_000} SOL
            </label>
            <input
              type="range"
              min="100000"
              max="10000000"
              step="100000"
              value={settings.tipLamports}
              onChange={(e) => onChange({ ...settings, tipLamports: parseInt(e.target.value, 10) })}
              className="w-full accent-obscura-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export { DEFAULT_SETTINGS };
export type { SwapSettings as SwapSettingsType };
