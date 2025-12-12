/**
 * T064: PaymentModal Component
 * Payment selection modal with M-Pesa and Card options
 */

import { createSignal, Show } from "solid-js";

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSelect: (method: 'mpesa' | 'card') => Promise<void>;
  amount: number;
  currency?: string;
  title?: string;
  description?: string;
}

export default function PaymentModal(props: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = createSignal<'mpesa' | 'card' | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  const currency = () => props.currency || 'KES';
  const formattedAmount = () => props.amount.toLocaleString();

  const handlePayment = async () => {
    const method = selectedMethod();
    if (!method) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await props.onPaymentSelect(method);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading()) {
      setSelectedMethod(null);
      setError('');
      props.onClose();
    }
  };

  return (
    <Show when={props.isOpen}>
      {/* Backdrop */}
      <div 
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        {/* Modal */}
        <div class="bg-base-100 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div class="p-6 border-b border-base-200">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-base-content">
                {props.title || 'Complete Payment'}
              </h2>
              <button 
                class="btn btn-ghost btn-sm btn-circle"
                onClick={handleClose}
                disabled={loading()}
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Show when={props.description}>
              <p class="text-sm text-base-content/60 mt-1">{props.description}</p>
            </Show>
          </div>

          {/* Amount Display */}
          <div class="p-6 bg-base-200/30 text-center">
            <p class="text-sm text-base-content/60 mb-1">Amount to Pay</p>
            <p class="text-4xl font-bold text-primary">
              {currency()} {formattedAmount()}
            </p>
          </div>

          {/* Payment Methods */}
          <div class="p-6 space-y-4">
            <p class="text-sm font-medium text-base-content/70">Select Payment Method</p>

            {/* M-Pesa Option */}
            <button
              class={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                selectedMethod() === 'mpesa'
                  ? 'border-success bg-success/10'
                  : 'border-base-200 hover:border-success/50'
              }`}
              onClick={() => setSelectedMethod('mpesa')}
              disabled={loading()}
            >
              <div class="w-14 h-14 rounded-xl bg-success/20 flex items-center justify-center">
                <span class="text-2xl">📱</span>
              </div>
              <div class="flex-1 text-left">
                <p class="font-semibold text-base-content">M-Pesa</p>
                <p class="text-sm text-base-content/60">Pay with mobile money</p>
              </div>
              <Show when={selectedMethod() === 'mpesa'}>
                <svg class="w-6 h-6 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </Show>
            </button>

            {/* Card Option */}
            <button
              class={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                selectedMethod() === 'card'
                  ? 'border-primary bg-primary/10'
                  : 'border-base-200 hover:border-primary/50'
              }`}
              onClick={() => setSelectedMethod('card')}
              disabled={loading()}
            >
              <div class="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <span class="text-2xl">💳</span>
              </div>
              <div class="flex-1 text-left">
                <p class="font-semibold text-base-content">Card Payment</p>
                <p class="text-sm text-base-content/60">Visa, Mastercard</p>
              </div>
              <Show when={selectedMethod() === 'card'}>
                <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </Show>
            </button>

            {/* Error Display */}
            <Show when={error()}>
              <div class="alert alert-error">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm">{error()}</span>
              </div>
            </Show>
          </div>

          {/* Footer */}
          <div class="p-6 bg-base-200/30 border-t border-base-200">
            <button
              class="btn btn-primary w-full"
              disabled={!selectedMethod() || loading()}
              onClick={handlePayment}
            >
              <Show when={loading()} fallback={
                <>
                  Pay {currency()} {formattedAmount()}
                  <svg class="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              }>
                <span class="loading loading-spinner loading-sm"></span>
                Processing...
              </Show>
            </button>

            <div class="flex items-center justify-center gap-4 mt-4">
              <img src="/paystack-badge.svg" alt="Secured by Paystack" class="h-6 opacity-60" />
              <div class="flex items-center gap-1 text-xs text-base-content/50">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
                Secure Payment
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}

// Export a hook-style opener for convenience
export function usePaymentModal() {
  const [isOpen, setIsOpen] = createSignal(false);
  const [config, setConfig] = createSignal<{
    amount: number;
    currency?: string;
    title?: string;
    description?: string;
    onSuccess?: () => void;
  } | null>(null);

  const open = (cfg: NonNullable<typeof config extends () => infer R ? R : never>) => {
    setConfig(cfg);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setConfig(null);
  };

  return {
    isOpen,
    config,
    open,
    close,
  };
}
