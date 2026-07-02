"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Swap } from "@phosphor-icons/react";

const features = [
  {
    label: "Shielded Transfers",
    description: "Break the on-chain link between sender and receiver using Merkle commitments and nullifiers.",
    icon: Shield,
    href: "/transfer",
    cta: "Transfer",
  },
  {
    label: "Private Swaps",
    description: "Route through Jupiter with confidential deposit and withdrawal via Helius Sender.",
    icon: Swap,
    href: "/swap",
    cta: "Swap",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] flex flex-col">
      {/* Asymmetric hero — left content, right negative space with logo */}
      <section className="flex-1 grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-0">
        {/* Left: content */}
        <div className="flex flex-col justify-center px-6 md:px-16 lg:px-24 py-16 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-obscura-primary animate-pulse-slow" />
              <span className="text-xs font-mono uppercase tracking-widest text-obscura-on-surface-variant">
                Live on Solana Devnet
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-obscura-on-surface mb-6">
              Privacy layers for<br />Solana DeFi
            </h1>

            <p className="text-base text-obscura-on-surface-variant leading-relaxed max-w-[65ch] mb-10">
              Obscura wraps token movements in zero-knowledge proofs and confidential
              transfers. Deposit into a shielded pool, transfer without revealing amounts,
              and swap through Jupiter with sender-receiver unlinkability.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/transfer"
                className="group inline-flex items-center gap-2 rounded-xl bg-obscura-primary px-6 py-3.5 text-sm font-semibold text-obscura-dark transition-all hover:brightness-110 active:scale-[0.98] active:-translate-y-[1px]"
              >
                Start Private Transfer
                <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/swap"
                className="group inline-flex items-center gap-2 rounded-xl border border-obscura-surface-variant px-6 py-3.5 text-sm font-semibold text-obscura-on-surface transition-all hover:border-obscura-on-surface-variant active:scale-[0.98] active:-translate-y-[1px]"
              >
                Private Swap
                <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right: logo with subtle float */}
        <div className="hidden md:flex items-center justify-center relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/logo/white_obscura_logotext.png"
                alt="Obscura"
                width={500}
                height={150}
                priority
                className="opacity-90"
              />
            </motion.div>
            <div className="absolute inset-0 -z-10 bg-obscura-primary/5 blur-[120px] rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Feature row — 2-col zig-zag, not 3 equal cards */}
      <section className="border-t border-obscura-surface-variant/50">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-obscura-surface-variant/50">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 + index * 0.15 }}
              className="p-8 md:p-12 group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-obscura-surface flex items-center justify-center border border-obscura-surface-variant">
                  <feature.icon size={20} weight="regular" className="text-obscura-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-obscura-on-surface mb-2 tracking-tight">
                    {feature.label}
                  </h3>
                  <p className="text-sm text-obscura-on-surface-variant leading-relaxed mb-4 max-w-[50ch]">
                    {feature.description}
                  </p>
                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-obscura-primary transition-colors hover:text-obscura-on-surface"
                  >
                    {feature.cta}
                    <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
