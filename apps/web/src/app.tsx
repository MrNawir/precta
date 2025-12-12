import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, createSignal } from "solid-js";
import ThemeToggle from "./components/ui/ThemeToggle";
import "./app.css";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);

  return (
    <header class="sticky top-0 z-50 w-full border-b border-base-200 bg-base-100/80 backdrop-blur-lg">
      <nav class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" class="flex items-center gap-2 group">
            <div class="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span class="text-xl font-bold text-base-content">Precta</span>
          </a>

          {/* Desktop Navigation */}
          <div class="hidden md:flex items-center gap-1">
            <a href="/doctors" class="px-4 py-2 text-sm font-medium text-base-content/70 hover:text-primary rounded-lg hover:bg-base-200 transition-colors">
              Find Doctors
            </a>
            <a href="/services" class="px-4 py-2 text-sm font-medium text-base-content/70 hover:text-primary rounded-lg hover:bg-base-200 transition-colors">
              Services
            </a>
            <a href="/about" class="px-4 py-2 text-sm font-medium text-base-content/70 hover:text-primary rounded-lg hover:bg-base-200 transition-colors">
              About
            </a>
          </div>

          {/* CTA Buttons */}
          <div class="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <a href="/auth/login" class="px-4 py-2 text-sm font-medium text-base-content hover:text-primary transition-colors">
              Log in
            </a>
            <a href="/auth/register" class="px-5 py-2.5 text-sm font-semibold text-white gradient-primary rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
              Get Started
            </a>
          </div>

          {/* Mobile menu button */}
          <button 
            class="md:hidden p-2 rounded-lg hover:bg-base-200 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen())}
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={mobileMenuOpen() ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen() && (
          <div class="md:hidden py-4 border-t border-base-200">
            <div class="flex flex-col gap-2">
              <a href="/doctors" class="px-4 py-3 text-base font-medium text-base-content hover:bg-base-200 rounded-lg">Find Doctors</a>
              <a href="/services" class="px-4 py-3 text-base font-medium text-base-content hover:bg-base-200 rounded-lg">Services</a>
              <a href="/about" class="px-4 py-3 text-base font-medium text-base-content hover:bg-base-200 rounded-lg">About</a>
              <div class="border-t border-base-200 my-2"></div>
              <div class="px-4 py-2 flex items-center justify-between">
                <span class="text-base font-medium text-base-content">Theme</span>
                <ThemeToggle />
              </div>
              <div class="border-t border-base-200 my-2"></div>
              <a href="/auth/login" class="px-4 py-3 text-base font-medium text-base-content hover:bg-base-200 rounded-lg">Log in</a>
              <a href="/auth/register" class="mx-4 py-3 text-center font-semibold text-white gradient-primary rounded-xl">Get Started</a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer class="bg-neutral text-neutral-content">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div class="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div class="lg:col-span-1">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span class="text-xl font-bold">Precta</span>
            </div>
            <p class="text-sm text-neutral-content/70 mb-6">
              Kenya's leading digital healthcare platform connecting patients with verified doctors for quality care.
            </p>
            <div class="flex gap-4">
              <a href="#" class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/></svg>
              </a>
              <a href="#" class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 class="font-semibold mb-4">For Patients</h3>
            <ul class="space-y-3 text-sm text-neutral-content/70">
              <li><a href="/doctors" class="hover:text-white transition-colors">Find a Doctor</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Book Appointment</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Video Consultation</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Health Records</a></li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mb-4">For Doctors</h3>
            <ul class="space-y-3 text-sm text-neutral-content/70">
              <li><a href="#" class="hover:text-white transition-colors">Join as Doctor</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Doctor Dashboard</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Manage Schedule</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Resources</a></li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mb-4">Company</h3>
            <ul class="space-y-3 text-sm text-neutral-content/70">
              <li><a href="/about" class="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div class="py-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-sm text-neutral-content/60">
            © 2024 Precta Healthcare. All rights reserved.
          </p>
          <div class="flex items-center gap-2 text-sm text-neutral-content/60">
            <span>🇰🇪</span>
            <span>Made with love in Kenya</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function LoadingSpinner() {
  return (
    <div class="min-h-[60vh] flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4"></div>
        <p class="text-base-content/60">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>Precta - Kenya's Healthcare Platform</Title>
          <div class="min-h-screen flex flex-col bg-base-100">
            <Navbar />
            <main class="flex-1">
              <Suspense fallback={<LoadingSpinner />}>
                {props.children}
              </Suspense>
            </main>
            <Footer />
          </div>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
