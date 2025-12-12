/**
 * T117: TransactionHistory Component
 * Display doctor's transaction history with filtering
 */

import { Show, For, createSignal } from "solid-js";

export interface Transaction {
  id: string;
  type: 'earning' | 'payout' | 'refund';
  amount: number;
  currency: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  appointmentId?: string;
  patientName?: string;
  createdAt: string;
}

export interface TransactionHistoryProps {
  transactions: Transaction[];
  currency?: string;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function TransactionHistory(props: TransactionHistoryProps) {
  const [filter, setFilter] = createSignal<'all' | 'earning' | 'payout' | 'refund'>('all');
  const currency = () => props.currency || 'KES';

  const formatCurrency = (amount: number) => `${currency()} ${amount.toLocaleString()}`;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredTransactions = () => {
    if (filter() === 'all') return props.transactions;
    return props.transactions.filter(t => t.type === filter());
  };

  const typeIcons: Record<string, string> = {
    earning: '💰',
    payout: '🏦',
    refund: '↩️',
  };

  const typeColors: Record<string, string> = {
    earning: 'text-success',
    payout: 'text-primary',
    refund: 'text-error',
  };

  const statusBadges: Record<string, string> = {
    completed: 'badge-success',
    pending: 'badge-warning',
    failed: 'badge-error',
  };

  return (
    <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
      {/* Header with filters */}
      <div class="p-4 border-b border-base-200 flex flex-wrap items-center justify-between gap-4">
        <h2 class="font-bold text-base-content">Transaction History</h2>
        
        <div class="flex gap-2">
          <button
            class={`btn btn-xs ${filter() === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            class={`btn btn-xs ${filter() === 'earning' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter('earning')}
          >
            💰 Earnings
          </button>
          <button
            class={`btn btn-xs ${filter() === 'payout' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter('payout')}
          >
            🏦 Payouts
          </button>
          <button
            class={`btn btn-xs ${filter() === 'refund' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter('refund')}
          >
            ↩️ Refunds
          </button>
        </div>
      </div>

      {/* Loading state */}
      <Show when={props.loading}>
        <div class="p-8 flex justify-center">
          <span class="loading loading-spinner loading-md text-primary"></span>
        </div>
      </Show>

      {/* Empty state */}
      <Show when={!props.loading && filteredTransactions().length === 0}>
        <div class="p-12 text-center">
          <div class="text-5xl mb-4">📊</div>
          <h3 class="font-bold text-base-content mb-2">No Transactions</h3>
          <p class="text-base-content/60 text-sm">
            {filter() === 'all' 
              ? 'Your transaction history will appear here'
              : `No ${filter()} transactions found`}
          </p>
        </div>
      </Show>

      {/* Transaction list */}
      <Show when={!props.loading && filteredTransactions().length > 0}>
        <div class="divide-y divide-base-200">
          <For each={filteredTransactions()}>
            {(tx) => (
              <div class="p-4 flex items-center gap-4 hover:bg-base-200/30 transition-colors">
                {/* Icon */}
                <div class={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  tx.type === 'earning' ? 'bg-success/10' :
                  tx.type === 'payout' ? 'bg-primary/10' : 'bg-error/10'
                }`}>
                  {typeIcons[tx.type]}
                </div>

                {/* Details */}
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="font-medium text-base-content truncate">
                      {tx.description}
                    </p>
                    <span class={`badge badge-xs ${statusBadges[tx.status]}`}>
                      {tx.status}
                    </span>
                  </div>
                  <p class="text-sm text-base-content/60">
                    {formatDate(tx.createdAt)}
                    <Show when={tx.patientName}>
                      {' • '}{tx.patientName}
                    </Show>
                  </p>
                </div>

                {/* Amount */}
                <div class="text-right">
                  <p class={`font-semibold ${typeColors[tx.type]}`}>
                    {tx.type === 'earning' ? '+' : tx.type === 'refund' ? '-' : ''}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Load more */}
        <Show when={props.hasMore && props.onLoadMore}>
          <div class="p-4 border-t border-base-200 text-center">
            <button class="btn btn-ghost btn-sm" onClick={props.onLoadMore}>
              Load More
            </button>
          </div>
        </Show>
      </Show>
    </div>
  );
}
