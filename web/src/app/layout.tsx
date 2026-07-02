import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { SolanaProvider } from "@/providers/SolanaProvider";

export const metadata: Metadata = {
  title: "Obscura — Privacy Swap & Transfer",
  description: "Privacy-preserving swap and transfer on Solana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SolanaProvider>
          <WalletProvider>{children}</WalletProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
