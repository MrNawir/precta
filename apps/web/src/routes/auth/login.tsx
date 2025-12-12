/**
 * Login Page
 */

import { Title } from "@solidjs/meta";
import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email(),
          password: password(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      // Redirect to dashboard or home
      navigate("/");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title>Login - Precta</Title>
      <div class="min-h-[80vh] flex items-center justify-center bg-base-200 py-12">
        <div class="card w-full max-w-md bg-base-100 shadow-xl">
          <div class="card-body">
            <h1 class="card-title text-2xl font-bold text-center justify-center mb-2">
              Welcome Back
            </h1>
            <p class="text-center text-base-content/70 mb-6">
              Sign in to your Precta account
            </p>

            {error() && (
              <div class="alert alert-error mb-4">
                <span>{error()}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div class="form-control mb-4">
                <label class="label">
                  <span class="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  class="input input-bordered w-full"
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  required
                />
              </div>

              <div class="form-control mb-6">
                <label class="label">
                  <span class="label-text">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  class="input input-bordered w-full"
                  value={password()}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  required
                />
                <label class="label">
                  <a href="/auth/forgot-password" class="label-text-alt link link-hover">
                    Forgot password?
                  </a>
                </label>
              </div>

              <button
                type="submit"
                class="btn btn-primary w-full"
                disabled={loading()}
              >
                {loading() ? (
                  <span class="loading loading-spinner loading-sm"></span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div class="divider">OR</div>

            <p class="text-center text-sm">
              Don't have an account?{" "}
              <a href="/auth/register" class="link link-primary">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
