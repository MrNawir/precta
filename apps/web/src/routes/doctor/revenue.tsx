/**
 * T115: Revenue Dashboard Page
 * Doctor views earnings and requests payouts
 */

import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { createSignal, createEffect, Show, For } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface RevenueSummary {
  totalEarnings: number;
  pendingPayout: number;
  totalPaidOut: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: 'earning' | 'payout' | 'refund';
  amount: number;
  currency: string;
  description: string;
  status: string;
  appointmentId?: string;
  patientName?: string;
  createdAt: string;
}

export default function RevenueDashboardPage() {
  const [summary, setSummary] = createSignal<RevenueSummary | null>(null);
  const [transactions, setTransactions] = createSignal<Transaction[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [showPayoutModal, setShowPayoutModal] = createSignal(false);

  // Payout form
  const [payoutAmount, setPayoutAmount] = createSignal('');
  const [bankName, setBankName] = createSignal('');
  const [accountNumber, setAccountNumber] = createSignal('');
  const [accountName, setAccountName] = createSignal('');

  // Fetch data
  createEffect(async () => {
    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/doctors/revenue/summary`, { credentials: 'include' }),
        fetch(`${API_URL}/api/v1/doctors/revenue/transactions`, { credentials: 'include' }),
      ]);

      const summaryData = await summaryRes.json();
      const transactionsData = await transactionsRes.json();

      if (summaryData.success) {
        setSummary(summaryData.data);
      }
      if (transactionsData.success) {
        setTransactions(transactionsData.data);
      }
    } catch (e) {
      console.error('Failed to fetch revenue data:', e);
    } finally {
      setLoading(false);
    }
  });

  const formatCurrency = (amount: number) => {
    const currency = summary()?.currency || 'KES';
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const growthPercent = () => {
    const thisMonth = summary()?.thisMonthEarnings || 0;
    const lastMonth = summary()?.lastMonthEarnings || 1;
    return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  };

  const handlePayout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/doctors/revenue/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: parseInt(payoutAmount()),
          bankDetails: {
            bankName: bankName(),
            accountNumber: accountNumber(),
            accountName: accountName(),
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowPayoutModal(false);
        // Refresh data
        window.location.reload();
      }
    } catch (e) {
      console.error('Payout failed:', e);
    }
  };

  return (
    <>
      <Title>Revenue Dashboard | Doctor | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-base-content">Revenue Dashboard</h1>
                <p class="text-base-content/60 mt-1">Track your earnings and payouts</p>
              </div>
              <button
                class="btn btn-primary"
                onClick={() => setShowPayoutModal(true)}
                disabled={!summary() || summary()!.pendingPayout < 1000}
              >
                Request Payout
              </button>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Show when={!loading()} fallback={
            <div class="flex justify-center py-12">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            {/* Summary Cards */}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Earnings */}
              <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-base-content/60">Total Earnings</p>
                    <p class="text-2xl font-bold text-base-content mt-1">
                      {formatCurrency(summary()?.totalEarnings || 0)}
                    </p>
                  </div>
                  <div class="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">💰</span>
                  </div>
                </div>
              </div>

              {/* Pending Payout */}
              <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-base-content/60">Available for Payout</p>
                    <p class="text-2xl font-bold text-primary mt-1">
                      {formatCurrency(summary()?.pendingPayout || 0)}
                    </p>
                  </div>
                  <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">🏦</span>
                  </div>
                </div>
              </div>

              {/* This Month */}
              <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-base-content/60">This Month</p>
                    <p class="text-2xl font-bold text-base-content mt-1">
                      {formatCurrency(summary()?.thisMonthEarnings || 0)}
                    </p>
                    <Show when={growthPercent() !== 0}>
                      <p class={`text-xs mt-1 ${growthPercent() > 0 ? 'text-success' : 'text-error'}`}>
                        {growthPercent() > 0 ? '+' : ''}{growthPercent()}% vs last month
                      </p>
                    </Show>
                  </div>
                  <div class="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">📈</span>
                  </div>
                </div>
              </div>

              {/* Paid Out */}
              <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-base-content/60">Total Paid Out</p>
                    <p class="text-2xl font-bold text-base-content mt-1">
                      {formatCurrency(summary()?.totalPaidOut || 0)}
                    </p>
                  </div>
                  <div class="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">✅</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
              <div class="p-4 bg-base-200/30 border-b border-base-200">
                <h2 class="font-bold text-base-content">Recent Transactions</h2>
              </div>

              <Show when={transactions().length > 0} fallback={
                <div class="p-12 text-center">
                  <div class="text-5xl mb-4">📊</div>
                  <p class="text-base-content/60">No transactions yet</p>
                  <p class="text-sm text-base-content/50 mt-2">
                    Complete consultations to start earning
                  </p>
                </div>
              }>
                <div class="divide-y divide-base-200">
                  <For each={transactions()}>
                    {(tx) => (
                      <div class="p-4 flex items-center gap-4 hover:bg-base-200/30">
                        <div class={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tx.type === 'earning' ? 'bg-success/10 text-success' :
                          tx.type === 'payout' ? 'bg-primary/10 text-primary' :
                          'bg-error/10 text-error'
                        }`}>
                          {tx.type === 'earning' ? '+' : tx.type === 'payout' ? '↑' : '-'}
                        </div>
                        <div class="flex-1">
                          <p class="font-medium text-base-content">{tx.description}</p>
                          <p class="text-sm text-base-content/60">{formatDate(tx.createdAt)}</p>
                        </div>
                        <div class="text-right">
                          <p class={`font-semibold ${
                            tx.type === 'earning' ? 'text-success' :
                            tx.type === 'refund' ? 'text-error' : ''
                          }`}>
                            {tx.type === 'earning' ? '+' : tx.type === 'refund' ? '-' : ''}
                            {formatCurrency(tx.amount)}
                          </p>
                          <span class={`badge badge-xs ${
                            tx.status === 'completed' ? 'badge-success' :
                            tx.status === 'pending' ? 'badge-warning' : 'badge-error'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </Show>
        </div>

        {/* Payout Modal */}
        <Show when={showPayoutModal()}>
          <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-base-100 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
              <div class="p-6 border-b border-base-200">
                <h2 class="text-xl font-bold text-base-content">Request Payout</h2>
                <p class="text-sm text-base-content/60 mt-1">
                  Available: {formatCurrency(summary()?.pendingPayout || 0)}
                </p>
              </div>

              <div class="p-6 space-y-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Amount (KES)</span>
                  </label>
                  <input
                    type="number"
                    class="input input-bordered w-full"
                    placeholder="Minimum 1,000"
                    value={payoutAmount()}
                    onInput={(e) => setPayoutAmount(e.currentTarget.value)}
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Bank Name</span>
                  </label>
                  <select
                    class="select select-bordered w-full"
                    value={bankName()}
                    onChange={(e) => setBankName(e.currentTarget.value)}
                  >
                    <option value="">Select bank</option>
                    <option value="Equity Bank">Equity Bank</option>
                    <option value="KCB Bank">KCB Bank</option>
                    <option value="Co-operative Bank">Co-operative Bank</option>
                    <option value="NCBA Bank">NCBA Bank</option>
                    <option value="Standard Chartered">Standard Chartered</option>
                    <option value="Stanbic Bank">Stanbic Bank</option>
                    <option value="M-Pesa">M-Pesa</option>
                  </select>
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Account Number</span>
                  </label>
                  <input
                    type="text"
                    class="input input-bordered w-full"
                    placeholder="Enter account number"
                    value={accountNumber()}
                    onInput={(e) => setAccountNumber(e.currentTarget.value)}
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Account Name</span>
                  </label>
                  <input
                    type="text"
                    class="input input-bordered w-full"
                    placeholder="Name on account"
                    value={accountName()}
                    onInput={(e) => setAccountName(e.currentTarget.value)}
                  />
                </div>
              </div>

              <div class="p-6 bg-base-200/30 flex justify-end gap-3">
                <button class="btn btn-ghost" onClick={() => setShowPayoutModal(false)}>
                  Cancel
                </button>
                <button
                  class="btn btn-primary"
                  onClick={handlePayout}
                  disabled={!payoutAmount() || !bankName() || !accountNumber() || !accountName()}
                >
                  Request Payout
                </button>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </>
  );
}
