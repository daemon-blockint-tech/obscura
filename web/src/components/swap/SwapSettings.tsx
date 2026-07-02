"use client";

import { useState } from "react";

export interface SwapSettings {
  slippageBps: number;
  priorityLevel: "Low" | "Medium" | "High";
  useHeliusSender: boolean;
  tipLamports: number;
}

const DEFAULT_SETTINGS: SwapSettings = {
  slippageBps: 50, // 0.5%
  priorityLevel: "High",
  useHeliusSender: true,
  tipLamports: 1_000_000, // 0.001 SOL
};

export function SwapSettings({ settings, onChange }: {
  settings: SwapSettings;
  onChange: (s: SwapSettings) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg bg-obscura-surface-variant px-3 py-2 text-sm text-obscura-on-surface-variant hover:text-obscura-primary"
      >
        Settings
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-obscura-surface p-4 border border-obscura-surface-variant shadow-lg z-10">
          <h3 className="text-sm font-semibold text-obscura-on-surface mb-3">Swap Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-obscura-on-surface-variant mb-1">
                Slippage: {(settings.slippageBps / 100).toFixed(1)}%
              </label>
              <div className="flex gap-2">
                {[10, 50, 100, 300].map((bps) => (
                  <button
                    key={bps}
                    onClick={() => onChange({ ...settings, slippageBps: bps })}
                    className={`flex-1 rounded px-2 py-1 text-xs ${
                      settings.slippageBps === bps
                        ? "bg-obscura-primary text-white"
                        : "bg-obscura-dark text-obscura-on-surface-variant"
                    }`}
                  >
                    {(bps / 100).toFixed(1)}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-obscura-on-surface-variant mb-1">Priority Fee Level</label>
              <div className="flex gap-2">
                {(["Low", "Medium", "High"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => onChange({ ...settings, priorityLevel: level })}
                    className={`flex-1 rounded px-2 py-1 text-xs ${
                      settings.priorityLevel === level
                        ? "bg-obscura-primary text-white"
                        : "bg-obscura-dark text-obscura-on-surface-variant"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-obscura-on-surface-variant">
                <input
                  type="checkbox"
                  checked={settings.useHeliusSender}
                  onChange={(e) => onChange({ ...settings, useHeliusSender: e.target.checked })}
                  className="accent-obscura-primary"
                />
                Use Helius Sender (fast tx landing)
              </label>
            </div>

            {settings.useHeliusSender && (
              <div>
                <label className="block text-xs text-obscura-on-surface-variant mb-1">
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
      )}
    </div>
  );
}

export { DEFAULT_SETTINGS };
export type { SwapSettings as SwapSettingsType };
