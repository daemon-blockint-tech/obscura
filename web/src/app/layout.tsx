import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { SolanaProvider } from "@/providers/SolanaProvider";

export const metadata: Metadata = {
  title: "Obscura — Privacy Swap & Transfer",
  description: "Privacy-preserving swap and transfer on Solana",
  icons: {
    icon: "/logo/black_obscura_logo.png",
    apple: "/logo/black_obscura_logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <SolanaProvider>
          <WalletProvider>{children}</WalletProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
