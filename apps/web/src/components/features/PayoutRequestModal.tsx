/**
 * T118: PayoutRequestModal Component
 * Modal for doctors to request payouts
 */

import { createSignal, Show } from "solid-js";

export interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  currency?: string;
  onSubmit: (data: PayoutRequest) => Promise<void>;
}

export interface PayoutRequest {
  amount: number;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

const KENYAN_BANKS = [
  'Equity Bank',
  'KCB Bank',
  'Co-operative Bank',
  'NCBA Bank',
  'Standard Chartered',
  'Stanbic Bank',
  'Absa Bank Kenya',
  'Diamond Trust Bank',
  'I&M Bank',
  'Family Bank',
  'M-Pesa (Safaricom)',
];

const MIN_PAYOUT = 1000;

export default function PayoutRequestModal(props: PayoutRequestModalProps) {
  const [amount, setAmount] = createSignal('');
  const [bankName, setBankName] = createSignal('');
  const [accountNumber, setAccountNumber] = createSignal('');
  const [accountName, setAccountName] = createSignal('');
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal('');

  const currency = () => props.currency || 'KES';
  const formatCurrency = (val: number) => `${currency()} ${val.toLocaleString()}`;

  const amountNum = () => parseInt(amount()) || 0;
  const isValidAmount = () => amountNum() >= MIN_PAYOUT && amountNum() <= props.availableBalance;
  const isFormValid = () => isValidAmount() && bankName() && accountNumber() && accountName();

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setError('');
    setSubmitting(true);

    try {
      await props.onSubmit({
        amount: amountNum(),
        bankDetails: {
          bankName: bankName(),
          accountNumber: accountNumber(),
          accountName: accountName(),
        },
      });
      // Reset form and close
      resetForm();
      props.onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to request payout');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setBankName('');
    setAccountNumber('');
    setAccountName('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    props.onClose();
  };

  const setMaxAmount = () => {
    setAmount(props.availableBalance.toString());
  };

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-base-100 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
          {/* Header */}
          <div class="p-6 border-b border-base-200">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-base-content">Request Payout</h2>
              <button class="btn btn-ghost btn-sm btn-circle" onClick={handleClose}>
                ✕
              </button>
            </div>
            <p class="text-sm text-base-content/60 mt-1">
              Available: <span class="font-semibold text-success">{formatCurrency(props.availableBalance)}</span>
            </p>
          </div>

          {/* Form */}
          <div class="p-6 space-y-4">
            {/* Error */}
            <Show when={error()}>
              <div class="alert alert-error">
                <span>{error()}</span>
              </div>
            </Show>

            {/* Amount */}
            <div class="form-control">
              <label class="label">
                <span class="label-text">Amount ({currency()})</span>
                <button class="label-text-alt link link-primary" onClick={setMaxAmount}>
                  Max
                </button>
              </label>
              <input
                type="number"
                class={`input input-bordered w-full ${!isValidAmount() && amount() ? 'input-error' : ''}`}
                placeholder={`Min ${formatCurrency(MIN_PAYOUT)}`}
                value={amount()}
                onInput={(e) => setAmount(e.currentTarget.value)}
                min={MIN_PAYOUT}
                max={props.availableBalance}
              />
              <Show when={amount() && !isValidAmount()}>
                <label class="label">
                  <span class="label-text-alt text-error">
                    {amountNum() < MIN_PAYOUT 
                      ? `Minimum payout is ${formatCurrency(MIN_PAYOUT)}`
                      : `Maximum available is ${formatCurrency(props.availableBalance)}`}
                  </span>
                </label>
              </Show>
            </div>

            {/* Bank Name */}
            <div class="form-control">
              <label class="label">
                <span class="label-text">Bank / Mobile Money</span>
              </label>
              <select
                class="select select-bordered w-full"
                value={bankName()}
                onChange={(e) => setBankName(e.currentTarget.value)}
              >
                <option value="">Select bank or M-Pesa</option>
                {KENYAN_BANKS.map(bank => (
                  <option value={bank}>{bank}</option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div class="form-control">
              <label class="label">
                <span class="label-text">
                  {bankName()?.includes('M-Pesa') ? 'Phone Number' : 'Account Number'}
                </span>
              </label>
              <input
                type="text"
                class="input input-bordered w-full"
                placeholder={bankName()?.includes('M-Pesa') ? '07XX XXX XXX' : 'Enter account number'}
                value={accountNumber()}
                onInput={(e) => setAccountNumber(e.currentTarget.value)}
              />
            </div>

            {/* Account Name */}
            <div class="form-control">
              <label class="label">
                <span class="label-text">Account Holder Name</span>
              </label>
              <input
                type="text"
                class="input input-bordered w-full"
                placeholder="Name as registered"
                value={accountName()}
                onInput={(e) => setAccountName(e.currentTarget.value)}
              />
            </div>

            {/* Processing info */}
            <div class="bg-base-200/50 rounded-xl p-4 text-sm text-base-content/70">
              <p class="font-medium mb-1">📌 Processing Time</p>
              <ul class="list-disc list-inside space-y-1 text-xs">
                <li>M-Pesa: Instant (within minutes)</li>
                <li>Bank transfer: 1-3 business days</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div class="p-6 bg-base-200/30 flex justify-end gap-3">
            <button class="btn btn-ghost" onClick={handleClose} disabled={submitting()}>
              Cancel
            </button>
            <button
              class="btn btn-primary"
              onClick={handleSubmit}
              disabled={!isFormValid() || submitting()}
            >
              <Show when={submitting()} fallback={`Request ${amount() ? formatCurrency(amountNum()) : 'Payout'}`}>
                <span class="loading loading-spinner loading-sm"></span>
                Processing...
              </Show>
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}
