/**
 * Landing Page - Premium UI
 * 
 * Investor-ready landing experience per User Story 1.
 * Features gradient hero, glassmorphic search, trust indicators,
 * and animated bento grid.
 * 
 * Design decisions:
 * - Light theme default for professional appeal
 * - No emojis (FR-002) - Lucide icons throughout
 * - Animations under 200ms (FR-003)
 * - WCAG AA compliant
 * 
 * References:
 * - Spec: /specs/003-premium-ui/spec.md#user-story-1
 * - DaisyUI 5: https://daisyui.com/docs/
 * 
 * @module routes/index
 */

import { Title } from "@solidjs/meta";
import { For, createSignal } from "solid-js";
import {
  Video, MapPin, TestTube, Scissors,
  Baby, Brain, Stethoscope, Pill,
  Search, Shield, Activity,
  ChevronRight, Star,
  Users, Building2, Heart, Clock
} from "lucide-solid";

// Premium UI Components
import TrustPanel from "~/components/layout/TrustPanel";
import FeatureGrid, { type FeatureItem } from "~/components/layout/FeatureGrid";

export default function Home() {
  const [location, setLocation] = createSignal("Nairobi");
  const [searchQuery, setSearchQuery] = createSignal("");

  /**
   * Main service cards for Bento Grid.
   * Typed as FeatureItem[] for type safety with FeatureGrid component.
   */
  const mainServices: FeatureItem[] = [
    {
      id: "consult",
      title: "Instant Video Consultation",
      description: "Connect with a specialist in 60 seconds",
      icon: Video,
      href: "/consult",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
      span: "col-span-12 md:col-span-8 lg:col-span-6",
      gradient: "from-primary/90 to-primary/70"
    },
    {
      id: "doctors",
      title: "Find Doctors",
      description: "Book confirmed appointments",
      icon: MapPin,
      href: "/doctors",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=400&fit=crop",
      span: "col-span-12 md:col-span-4 lg:col-span-3",
      gradient: "from-secondary/90 to-secondary/70"
    },
    {
      id: "lab-tests",
      title: "Lab Tests",
      description: "Home sample collection",
      icon: TestTube,
      href: "/lab-tests",
      image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=400&fit=crop",
      span: "col-span-12 md:col-span-4 lg:col-span-3",
      gradient: "from-accent/90 to-accent/70"
    },
    {
      id: "surgeries",
      title: "Surgeries",
      description: "Trusted surgical care",
      icon: Scissors,
      href: "/surgeries",
      image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=400&fit=crop",
      span: "col-span-12 md:col-span-4 lg:col-span-6",
      gradient: "from-info/90 to-info/70"
    },
  ];

  // Quick health concerns
  const healthConcerns = [
    { name: "Period doubts", icon: Baby, specialty: "Gynecology" }, // Using Baby as proxy for pregnancy/fertility
    { name: "Skin issues", icon: Activity, specialty: "Dermatology" },
    { name: "Cold & Fever", icon: Stethoscope, specialty: "General Practice" },
    { name: "Child health", icon: Baby, specialty: "Pediatrics" },
    { name: "Depression", icon: Brain, specialty: "Psychiatry" },
    { name: "Digestion", icon: Pill, specialty: "Gastroenterology" },
  ];

  // Specialties
  const specialties = [
    { name: "Dentist", icon: Activity, doctors: 95 }, // Generic Activity if Tooth not available, check imports
    { name: "Gynecologist", icon: Users, doctors: 64 },
    { name: "Dietitian", icon: Pill, doctors: 45 },
    { name: "Physio", icon: Activity, doctors: 38 },
    { name: "Surgeon", icon: Scissors, doctors: 42 },
    { name: "Orthopedist", icon: Activity, doctors: 35 },
    { name: "Pediatrician", icon: Baby, doctors: 85 },
    { name: "Cardiologist", icon: Activity, doctors: 42 },
  ];

  // Stats
  const stats = [
    { value: "50k+", label: "Patients Served" },
    { value: "500+", label: "Verified Doctors" },
    { value: "20+", label: "Cities" },
    { value: "98%", label: "Satisfaction" },
  ];

  const corporateFeatures = [
    { title: "Employee Health", description: "Tailored packages", icon: Users },
    { title: "Mental Wellness", description: "Counseling services", icon: Brain },
    { title: "Health Checks", description: "Annual screenings", icon: Activity },
    { title: "On-site Support", description: "Doctors at work", icon: Building2 },
  ];

  return (
    <>
      <Title>Precta - Modern Healthcare for Kenya</Title>

      {/* Premium Hero Section */}
      <section class="gradient-hero pt-8 pb-16 lg:pb-24 border-b border-base-200/50">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="max-w-4xl mx-auto text-center mb-12 animate-fade-in-up">
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-base-content mb-6 tracking-tight">
              Your Health, <span class="text-gradient">Elevated.</span>
            </h1>
            <p class="text-lg md:text-xl text-base-content/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              Book appointments, consult specialists online, and manage your family's health with Kenya's most trusted digital healthcare platform.
            </p>

            {/* Search Bar - Glassmorphism */}
            <div class="glass-panel p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-lg max-w-3xl mx-auto">
              {/* Location */}
              <div class="relative min-w-[200px]">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin class="h-5 w-5 text-primary" />
                </div>
                <select
                  class="select select-ghost w-full pl-10 focus:bg-transparent font-medium border-none focus:outline-none"
                  value={location()}
                  onChange={(e) => setLocation(e.currentTarget.value)}
                >
                  <option>Nairobi</option>
                  <option>Mombasa</option>
                  <option>Kisumu</option>
                  <option>Nakuru</option>
                  <option>Eldoret</option>
                </select>
              </div>

              <div class="hidden md:block w-px bg-base-300 my-2"></div>

              {/* Search */}
              <div class="flex-1 relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search class="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  placeholder="Search doctors, symptoms, hospitals..."
                  class="input input-ghost w-full pl-10 focus:bg-transparent border-none focus:outline-none h-12"
                  value={searchQuery()}
                  onInput={(e) => setSearchQuery(e.currentTarget.value)}
                />
              </div>

              <button class="btn btn-primary rounded-xl px-8 h-12 text-white shadow-lg shadow-primary/25 border-none">
                Search
              </button>
            </div>
          </div>

          {/* Trust Indicators - Premium component with animated badges */}
          <TrustPanel />
        </div>
      </section>

      {/* Bento Grid Services - Premium FeatureGrid component */}
      <section class="py-16 bg-base-100">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <FeatureGrid items={mainServices} />
        </div>
      </section>

      {/* Quick Access */}
      <section class="py-16 bg-base-200/50">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between mb-10">
            <h2 class="text-2xl font-bold text-base-content">Consult Top Specialists</h2>
            <a href="/doctors" class="btn btn-ghost btn-sm text-primary">View All <ChevronRight class="w-4 h-4" /></a>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <For each={healthConcerns}>
              {(concern) => (
                <a href="/consult" class="card-hover bg-base-100 p-6 rounded-2xl border border-dashed border-base-300 hover:border-primary/50 flex flex-col items-center gap-4 text-center">
                  <div class="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-2">
                    <concern.icon class="w-8 h-8" />
                  </div>
                  <span class="font-medium text-sm">{concern.name}</span>
                </a>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Stats with Parallax feel */}
      <section class="py-20 bg-neutral text-neutral-content relative overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div class="container mx-auto px-4 relative z-10">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
            <For each={stats}>
              {(stat) => (
                <div class="text-center px-4">
                  <div class="text-4xl md:text-5xl font-bold mb-2 text-primary">{stat.value}</div>
                  <div class="text-sm uppercase tracking-wider opacity-70">{stat.label}</div>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Corporate Section */}
      <section class="py-20">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-base-100 rounded-[2.5rem] p-8 md:p-16 shadow-2xl border border-base-200 flex flex-col md:flex-row gap-12 items-center">
            <div class="flex-1">
              <span class="badge badge-accent badge-outline mb-4">FOR CORPORATES</span>
              <h2 class="text-3xl md:text-4xl font-bold mb-6">Healthy Employees, Healthy Business</h2>
              <p class="text-base-content/60 mb-8 text-lg">
                Comprehensive healthcare plans designed to boost productivity and employee satisfaction.
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <For each={corporateFeatures}>
                  {(feature) => (
                    <div class="flex items-start gap-3">
                      <div class="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                        <feature.icon class="w-5 h-5" />
                      </div>
                      <div>
                        <h4 class="font-semibold">{feature.title}</h4>
                        <p class="text-sm text-base-content/60">{feature.description}</p>
                      </div>
                    </div>
                  )}
                </For>
              </div>

              <a href="/corporate" class="btn btn-primary rounded-xl px-8">Get Corporate Plan</a>
            </div>

            <div class="flex-1 w-full relative">
              <div class="absolute -inset-4 bg-linear-to-r from-primary to-accent opacity-20 blur-3xl rounded-full"></div>
              <div class="glass-panel p-8 rounded-3xl relative">
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-12 h-12 rounded-full bg-base-200"></div>
                  <div>
                    <div class="h-4 w-32 bg-base-200 rounded mb-2"></div>
                    <div class="h-3 w-20 bg-base-200 rounded"></div>
                  </div>
                </div>
                <div class="space-y-3">
                  <div class="h-3 w-full bg-base-200 rounded"></div>
                  <div class="h-3 w-5/6 bg-base-200 rounded"></div>
                  <div class="h-3 w-4/6 bg-base-200 rounded"></div>
                </div>
                <div class="mt-6 flex justify-between items-center">
                  <div class="h-8 w-24 bg-primary/20 rounded-lg"></div>
                  <div class="h-8 w-8 bg-base-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section class="py-20 bg-base-200/30">
        <div class="container mx-auto px-4 text-center max-w-3xl">
          <div class="flex justify-center gap-1 mb-8 text-warning">
            <For each={[1, 2, 3, 4, 5]}>{() => <Star class="w-6 h-6 fill-current" />}</For>
          </div>
          <h3 class="text-2xl md:text-3xl font-medium leading-relaxed mb-8">
            "Precta transformed how I manage my family's health. The video consultations are flawless, and having prescriptions delivered to my door is a game changer."
          </h3>
          <div class="flex items-center justify-center gap-4">
            <div class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
              JM
            </div>
            <div class="text-left">
              <div class="font-bold">Jane Muthoni</div>
              <div class="text-sm text-base-content/60">Verified Patient</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
