/**
 * T105: Order Checkout Page
 * Patient orders medicines from prescription
 */

import { Title } from "@solidjs/meta";
import { useSearchParams, useNavigate, A } from "@solidjs/router";
import { createSignal, createEffect, Show, For } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Medication {
  name: string;
  dosage: string;
  quantity: number;
  unitPrice: number;
}

interface Prescription {
  id: string;
  medications: Medication[];
  doctor: {
    firstName: string;
    lastName: string;
  };
}

interface DeliveryAddress {
  street: string;
  city: string;
  county: string;
  postalCode?: string;
  phone: string;
  notes?: string;
}

export default function OrderCheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [prescription, setPrescription] = createSignal<Prescription | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal('');
  const [step, setStep] = createSignal<'items' | 'delivery' | 'payment'>('items');

  // Delivery form
  const [address, setAddress] = createSignal<DeliveryAddress>({
    street: '',
    city: '',
    county: 'Nairobi',
    phone: '',
  });

  // Pricing (could come from API)
  const [pricing] = createSignal<Record<string, number>>({});
  const DELIVERY_FEE = 250;

  // Fetch prescription
  createEffect(async () => {
    const prescriptionId = searchParams.prescriptionId;
    if (!prescriptionId) {
      setError('No prescription specified');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/v1/prescriptions/${prescriptionId}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        // Add default pricing
        const meds = data.data.medications.map((med: any) => ({
          ...med,
          quantity: med.quantity || 1,
          unitPrice: pricing()[med.name] || 500, // Default KES 500
        }));
        setPrescription({ ...data.data, medications: meds });
      } else {
        setError(data.error || 'Failed to load prescription');
      }
    } catch (e) {
      setError('Failed to load prescription');
    } finally {
      setLoading(false);
    }
  });

  const subtotal = () => {
    const meds = prescription()?.medications || [];
    return meds.reduce((sum, med) => sum + (med.quantity * med.unitPrice), 0);
  };

  const total = () => subtotal() + DELIVERY_FEE;

  const updateQuantity = (index: number, delta: number) => {
    const presc = prescription();
    if (!presc) return;

    const meds = [...presc.medications];
    const newQty = Math.max(1, meds[index].quantity + delta);
    meds[index] = { ...meds[index], quantity: newQty };
    setPrescription({ ...presc, medications: meds });
  };

  const validateDelivery = (): boolean => {
    const addr = address();
    if (!addr.street.trim()) {
      setError('Please enter street address');
      return false;
    }
    if (!addr.city.trim()) {
      setError('Please enter city');
      return false;
    }
    if (!addr.phone.trim()) {
      setError('Please enter phone number');
      return false;
    }
    setError('');
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateDelivery()) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/v1/orders/from-prescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          prescriptionId: prescription()?.id,
          deliveryAddress: address(),
          pricing: pricing(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to payment or order detail
        navigate(`/patient/orders/${data.data.id}`);
      } else {
        setError(data.error || 'Failed to create order');
      }
    } catch (e) {
      setError('Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
    'Kiambu', 'Machakos', 'Kajiado', 'Nyeri', 'Meru',
  ];

  return (
    <>
      <Title>Order Medicines | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center gap-4">
              <A href="/patient/prescriptions" class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </A>
              <h1 class="text-xl font-bold text-base-content">Order Medicines</h1>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          <Show when={!loading()} fallback={
            <div class="flex justify-center py-12">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            <Show when={prescription()} fallback={
              <div class="bg-base-100 rounded-2xl border border-base-200 p-12 text-center">
                <div class="text-5xl mb-4">📋</div>
                <p class="text-base-content/60">{error() || 'Prescription not found'}</p>
              </div>
            }>
              {/* Steps */}
              <ul class="steps steps-horizontal w-full mb-8">
                <li class={`step ${step() === 'items' || step() === 'delivery' || step() === 'payment' ? 'step-primary' : ''}`}>
                  Items
                </li>
                <li class={`step ${step() === 'delivery' || step() === 'payment' ? 'step-primary' : ''}`}>
                  Delivery
                </li>
                <li class={`step ${step() === 'payment' ? 'step-primary' : ''}`}>
                  Payment
                </li>
              </ul>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div class="lg:col-span-2">
                  {/* Items Step */}
                  <Show when={step() === 'items'}>
                    <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
                      <div class="p-4 bg-base-200/30 border-b border-base-200">
                        <h2 class="font-bold text-base-content">Medications</h2>
                        <p class="text-sm text-base-content/60">
                          Prescribed by Dr. {prescription()?.doctor?.firstName} {prescription()?.doctor?.lastName}
                        </p>
                      </div>

                      <div class="divide-y divide-base-200">
                        <For each={prescription()?.medications}>
                          {(med, index) => (
                            <div class="p-4 flex items-center gap-4">
                              <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
                                💊
                              </div>
                              <div class="flex-1">
                                <h3 class="font-medium text-base-content">{med.name}</h3>
                                <p class="text-sm text-base-content/60">{med.dosage}</p>
                                <p class="text-sm text-primary mt-1">{formatCurrency(med.unitPrice)} each</p>
                              </div>
                              <div class="flex items-center gap-2">
                                <button
                                  class="btn btn-ghost btn-sm btn-circle"
                                  onClick={() => updateQuantity(index(), -1)}
                                >
                                  -
                                </button>
                                <span class="w-8 text-center font-medium">{med.quantity}</span>
                                <button
                                  class="btn btn-ghost btn-sm btn-circle"
                                  onClick={() => updateQuantity(index(), 1)}
                                >
                                  +
                                </button>
                              </div>
                              <div class="text-right min-w-20">
                                <p class="font-semibold">{formatCurrency(med.quantity * med.unitPrice)}</p>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>

                      <div class="p-4 border-t border-base-200">
                        <button
                          class="btn btn-primary w-full"
                          onClick={() => setStep('delivery')}
                        >
                          Continue to Delivery
                        </button>
                      </div>
                    </div>
                  </Show>

                  {/* Delivery Step */}
                  <Show when={step() === 'delivery'}>
                    <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                      <h2 class="font-bold text-base-content mb-4">Delivery Address</h2>

                      <div class="space-y-4">
                        <div class="form-control">
                          <label class="label">
                            <span class="label-text">Street Address *</span>
                          </label>
                          <input
                            type="text"
                            class="input input-bordered w-full"
                            placeholder="e.g., 123 Kimathi Street, Apt 4B"
                            value={address().street}
                            onInput={(e) => setAddress({ ...address(), street: e.currentTarget.value })}
                          />
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                          <div class="form-control">
                            <label class="label">
                              <span class="label-text">City *</span>
                            </label>
                            <input
                              type="text"
                              class="input input-bordered w-full"
                              placeholder="e.g., Nairobi"
                              value={address().city}
                              onInput={(e) => setAddress({ ...address(), city: e.currentTarget.value })}
                            />
                          </div>

                          <div class="form-control">
                            <label class="label">
                              <span class="label-text">County *</span>
                            </label>
                            <select
                              class="select select-bordered w-full"
                              value={address().county}
                              onChange={(e) => setAddress({ ...address(), county: e.currentTarget.value })}
                            >
                              <For each={counties}>
                                {(county) => <option value={county}>{county}</option>}
                              </For>
                            </select>
                          </div>
                        </div>

                        <div class="form-control">
                          <label class="label">
                            <span class="label-text">Phone Number *</span>
                          </label>
                          <input
                            type="tel"
                            class="input input-bordered w-full"
                            placeholder="e.g., 0712 345 678"
                            value={address().phone}
                            onInput={(e) => setAddress({ ...address(), phone: e.currentTarget.value })}
                          />
                        </div>

                        <div class="form-control">
                          <label class="label">
                            <span class="label-text">Delivery Notes (Optional)</span>
                          </label>
                          <textarea
                            class="textarea textarea-bordered w-full"
                            placeholder="Any special instructions for delivery..."
                            value={address().notes || ''}
                            onInput={(e) => setAddress({ ...address(), notes: e.currentTarget.value })}
                          />
                        </div>
                      </div>

                      <Show when={error()}>
                        <div class="alert alert-error mt-4">
                          <span>{error()}</span>
                        </div>
                      </Show>

                      <div class="flex gap-3 mt-6">
                        <button class="btn btn-ghost" onClick={() => setStep('items')}>
                          Back
                        </button>
                        <button
                          class="btn btn-primary flex-1"
                          onClick={() => {
                            if (validateDelivery()) setStep('payment');
                          }}
                        >
                          Continue to Payment
                        </button>
                      </div>
                    </div>
                  </Show>

                  {/* Payment Step */}
                  <Show when={step() === 'payment'}>
                    <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                      <h2 class="font-bold text-base-content mb-4">Payment</h2>

                      <div class="space-y-4">
                        {/* M-Pesa */}
                        <label class="flex items-center gap-4 p-4 border border-base-200 rounded-xl cursor-pointer hover:bg-base-200/50">
                          <input type="radio" name="payment" class="radio radio-primary" checked />
                          <div class="flex-1">
                            <p class="font-medium">M-Pesa</p>
                            <p class="text-sm text-base-content/60">Pay via M-Pesa</p>
                          </div>
                          <div class="w-12 h-8 bg-success/10 rounded flex items-center justify-center text-xs font-bold text-success">
                            M-PESA
                          </div>
                        </label>

                        {/* Card */}
                        <label class="flex items-center gap-4 p-4 border border-base-200 rounded-xl cursor-pointer hover:bg-base-200/50">
                          <input type="radio" name="payment" class="radio radio-primary" />
                          <div class="flex-1">
                            <p class="font-medium">Card Payment</p>
                            <p class="text-sm text-base-content/60">Visa, Mastercard</p>
                          </div>
                          <div class="flex gap-1">
                            <div class="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center">V</div>
                            <div class="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center">MC</div>
                          </div>
                        </label>
                      </div>

                      <Show when={error()}>
                        <div class="alert alert-error mt-4">
                          <span>{error()}</span>
                        </div>
                      </Show>

                      <div class="flex gap-3 mt-6">
                        <button class="btn btn-ghost" onClick={() => setStep('delivery')}>
                          Back
                        </button>
                        <button
                          class="btn btn-primary flex-1"
                          onClick={handlePlaceOrder}
                          disabled={submitting()}
                        >
                          <Show when={submitting()} fallback={`Pay ${formatCurrency(total())}`}>
                            <span class="loading loading-spinner loading-sm"></span>
                            Processing...
                          </Show>
                        </button>
                      </div>
                    </div>
                  </Show>
                </div>

                {/* Order Summary */}
                <div class="lg:col-span-1">
                  <div class="bg-base-100 rounded-2xl border border-base-200 p-6 sticky top-24">
                    <h3 class="font-bold text-base-content mb-4">Order Summary</h3>

                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-base-content/60">Subtotal</span>
                        <span>{formatCurrency(subtotal())}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-base-content/60">Delivery</span>
                        <span>{formatCurrency(DELIVERY_FEE)}</span>
                      </div>
                      <div class="divider my-2"></div>
                      <div class="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span class="text-primary">{formatCurrency(total())}</span>
                      </div>
                    </div>

                    <p class="text-xs text-base-content/50 mt-4">
                      Estimated delivery: 3-5 business days
                    </p>
                  </div>
                </div>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </>
  );
}
