/**
 * Registration Page
 */

import { Title } from "@solidjs/meta";
import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = createSignal({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    const data = formData();

    // Validation
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (data.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Registration failed. Please try again.");
        return;
      }

      // Redirect to login or verification page
      navigate("/auth/login?registered=true");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title>Sign Up - Precta</Title>
      <div class="min-h-[80vh] flex items-center justify-center bg-base-200 py-12">
        <div class="card w-full max-w-md bg-base-100 shadow-xl">
          <div class="card-body">
            <h1 class="card-title text-2xl font-bold text-center justify-center mb-2">
              Create Account
            </h1>
            <p class="text-center text-base-content/70 mb-6">
              Join Precta to manage your health
            </p>

            {error() && (
              <div class="alert alert-error mb-4">
                <span>{error()}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">First Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    class="input input-bordered w-full"
                    value={formData().firstName}
                    onInput={(e) => updateField("firstName", e.currentTarget.value)}
                    required
                  />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Last Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    class="input input-bordered w-full"
                    value={formData().lastName}
                    onInput={(e) => updateField("lastName", e.currentTarget.value)}
                    required
                  />
                </div>
              </div>

              <div class="form-control mb-4">
                <label class="label">
                  <span class="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  class="input input-bordered w-full"
                  value={formData().email}
                  onInput={(e) => updateField("email", e.currentTarget.value)}
                  required
                />
              </div>

              <div class="form-control mb-4">
                <label class="label">
                  <span class="label-text">Phone Number</span>
                </label>
                <input
                  type="tel"
                  placeholder="+254 7XX XXX XXX"
                  class="input input-bordered w-full"
                  value={formData().phone}
                  onInput={(e) => updateField("phone", e.currentTarget.value)}
                />
              </div>

              <div class="form-control mb-4">
                <label class="label">
                  <span class="label-text">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  class="input input-bordered w-full"
                  value={formData().password}
                  onInput={(e) => updateField("password", e.currentTarget.value)}
                  required
                  minLength={8}
                />
              </div>

              <div class="form-control mb-6">
                <label class="label">
                  <span class="label-text">Confirm Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Repeat your password"
                  class="input input-bordered w-full"
                  value={formData().confirmPassword}
                  onInput={(e) => updateField("confirmPassword", e.currentTarget.value)}
                  required
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary w-full"
                disabled={loading()}
              >
                {loading() ? (
                  <span class="loading loading-spinner loading-sm"></span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p class="text-center text-xs text-base-content/60 mt-4">
              By signing up, you agree to our{" "}
              <a href="/terms" class="link">Terms of Service</a> and{" "}
              <a href="/privacy" class="link">Privacy Policy</a>
            </p>

            <div class="divider">OR</div>

            <p class="text-center text-sm">
              Already have an account?{" "}
              <a href="/auth/login" class="link link-primary">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
