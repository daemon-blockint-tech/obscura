import { TransferForm } from "@/components/transfer/TransferForm";
import { DepositForm } from "@/components/transfer/DepositForm";
import { WithdrawForm } from "@/components/transfer/WithdrawForm";
import { BalanceDisplay } from "@/components/transfer/BalanceDisplay";
import { ArrowsLeftRight } from "@phosphor-icons/react";

export default function TransferPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-6 py-12">
      <div className="flex items-center gap-3 mb-10">
        <ArrowsLeftRight size={24} weight="regular" className="text-obscura-primary" />
        <h1 className="text-2xl md:text-3xl tracking-tight font-bold text-obscura-on-surface">
          Private Transfer
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        {/* Left: balance sidebar */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <BalanceDisplay />
        </div>

        {/* Right: operations */}
        <div className="space-y-6">
          <DepositForm />
          <TransferForm />
          <WithdrawForm />
        </div>
      </div>
    </main>
  );
}
