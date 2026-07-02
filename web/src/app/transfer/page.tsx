import { TransferForm } from "@/components/transfer/TransferForm";
import { DepositForm } from "@/components/transfer/DepositForm";
import { WithdrawForm } from "@/components/transfer/WithdrawForm";
import { BalanceDisplay } from "@/components/transfer/BalanceDisplay";

export default function TransferPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-obscura-primary">Private Transfer</h1>

        <BalanceDisplay />

        <div className="grid grid-cols-1 gap-6">
          <DepositForm />
          <TransferForm />
          <WithdrawForm />
        </div>
      </div>
    </main>
  );
}
