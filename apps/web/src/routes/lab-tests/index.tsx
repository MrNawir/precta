/**
 * Lab Tests Page - Practo-style lab test booking
 */

import { Title } from "@solidjs/meta";
import { For, createSignal } from "solid-js";

export default function LabTestsPage() {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedCategory, setSelectedCategory] = createSignal("all");

  const categories = [
    { id: "all", name: "All Tests", icon: "🧪" },
    { id: "popular", name: "Popular", icon: "⭐" },
    { id: "diabetes", name: "Diabetes", icon: "🩸" },
    { id: "heart", name: "Heart", icon: "❤️" },
    { id: "thyroid", name: "Thyroid", icon: "🦋" },
    { id: "vitamins", name: "Vitamins", icon: "💊" },
    { id: "liver", name: "Liver", icon: "🫁" },
    { id: "kidney", name: "Kidney", icon: "🫘" },
  ];

  const popularTests = [
    {
      id: "1",
      name: "Complete Blood Count (CBC)",
      description: "Measures red blood cells, white blood cells, and platelets",
      originalPrice: 800,
      discountedPrice: 399,
      parameters: 24,
      reportTime: "Same Day",
      category: "popular",
    },
    {
      id: "2",
      name: "Thyroid Profile (T3, T4, TSH)",
      description: "Complete thyroid function assessment",
      originalPrice: 1500,
      discountedPrice: 699,
      parameters: 3,
      reportTime: "Same Day",
      category: "thyroid",
    },
    {
      id: "3",
      name: "Lipid Profile",
      description: "Cholesterol and triglyceride levels",
      originalPrice: 1200,
      discountedPrice: 549,
      parameters: 8,
      reportTime: "Same Day",
      category: "heart",
    },
    {
      id: "4",
      name: "HbA1c (Diabetes Test)",
      description: "3-month average blood sugar level",
      originalPrice: 900,
      discountedPrice: 449,
      parameters: 1,
      reportTime: "Same Day",
      category: "diabetes",
    },
    {
      id: "5",
      name: "Liver Function Test (LFT)",
      description: "Complete liver health assessment",
      originalPrice: 1400,
      discountedPrice: 649,
      parameters: 12,
      reportTime: "Same Day",
      category: "liver",
    },
    {
      id: "6",
      name: "Kidney Function Test (KFT)",
      description: "Kidney health and function markers",
      originalPrice: 1200,
      discountedPrice: 549,
      parameters: 8,
      reportTime: "Same Day",
      category: "kidney",
    },
    {
      id: "7",
      name: "Vitamin D Test",
      description: "Vitamin D levels in blood",
      originalPrice: 1800,
      discountedPrice: 799,
      parameters: 1,
      reportTime: "Same Day",
      category: "vitamins",
    },
    {
      id: "8",
      name: "Vitamin B12 Test",
      description: "Vitamin B12 deficiency check",
      originalPrice: 1200,
      discountedPrice: 599,
      parameters: 1,
      reportTime: "Same Day",
      category: "vitamins",
    },
  ];

  const healthPackages = [
    {
      id: "basic",
      name: "Basic Health Checkup",
      tests: 45,
      originalPrice: 4500,
      discountedPrice: 1999,
      includes: ["CBC", "Blood Sugar", "Lipid Profile", "Liver Function", "Kidney Function"],
      popular: false,
    },
    {
      id: "comprehensive",
      name: "Comprehensive Health Package",
      tests: 78,
      originalPrice: 8500,
      discountedPrice: 3999,
      includes: ["All Basic Tests", "Thyroid Profile", "Vitamin D", "Vitamin B12", "Iron Studies"],
      popular: true,
    },
    {
      id: "senior",
      name: "Senior Citizen Package",
      tests: 95,
      originalPrice: 12000,
      discountedPrice: 5499,
      includes: ["All Comprehensive Tests", "PSA/CA-125", "ECG", "Chest X-Ray", "Bone Profile"],
      popular: false,
    },
  ];

  const features = [
    { icon: "🏠", title: "Home Sample Collection", description: "Free collection from your doorstep" },
    { icon: "✅", title: "NABL Certified Labs", description: "100% accurate & trusted results" },
    { icon: "📱", title: "Digital Reports", description: "Instant access on your phone" },
    { icon: "👨‍⚕️", title: "Doctor Consultation", description: "Free report analysis by doctors" },
  ];

  const filteredTests = () => {
    let tests = popularTests;
    
    if (selectedCategory() !== "all") {
      tests = tests.filter(t => t.category === selectedCategory() || selectedCategory() === "popular");
    }
    
    if (searchQuery()) {
      const query = searchQuery().toLowerCase();
      tests = tests.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query)
      );
    }
    
    return tests;
  };

  return (
    <>
      <Title>Lab Tests - Book Online | Precta</Title>

      {/* Hero Section */}
      <section class="bg-gradient-to-br from-purple-500 to-pink-600 text-white py-16">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="max-w-3xl">
            <h1 class="text-4xl sm:text-5xl font-bold mb-4">
              Book Lab Tests Online
            </h1>
            <p class="text-xl text-white/80 mb-8">
              Home sample collection • NABL certified labs • Digital reports
            </p>
            
            {/* Search Bar */}
            <div class="relative max-w-xl">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search for tests, packages, or health conditions..."
                class="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section class="bg-base-100 border-b border-base-200 py-6">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <For each={features}>
              {(feature) => (
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{feature.icon}</span>
                  <div>
                    <h3 class="font-semibold text-base-content text-sm">{feature.title}</h3>
                    <p class="text-xs text-base-content/60">{feature.description}</p>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Health Packages */}
      <section class="py-12 bg-base-200/30">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-base-content mb-8">
            Popular Health Packages
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <For each={healthPackages}>
              {(pkg) => (
                <div class={`relative p-6 bg-base-100 rounded-2xl border-2 ${pkg.popular ? 'border-primary' : 'border-base-200'} hover:shadow-lg transition-all`}>
                  {pkg.popular && (
                    <span class="absolute -top-3 left-6 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                      MOST POPULAR
                    </span>
                  )}
                  
                  <h3 class="text-xl font-bold text-base-content mb-2">{pkg.name}</h3>
                  <p class="text-sm text-base-content/60 mb-4">{pkg.tests} tests included</p>
                  
                  <div class="mb-4">
                    <span class="text-3xl font-bold text-primary">KES {pkg.discountedPrice.toLocaleString()}</span>
                    <span class="text-base-content/50 line-through ml-2">KES {pkg.originalPrice.toLocaleString()}</span>
                    <span class="ml-2 px-2 py-1 bg-success/10 text-success text-xs font-semibold rounded">
                      {Math.round((1 - pkg.discountedPrice / pkg.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                  
                  <ul class="space-y-2 mb-6">
                    <For each={pkg.includes}>
                      {(item) => (
                        <li class="flex items-center gap-2 text-sm text-base-content/70">
                          <svg class="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      )}
                    </For>
                  </ul>
                  
                  <button class={`w-full py-3 font-semibold rounded-xl transition-colors ${pkg.popular ? 'gradient-primary text-white' : 'bg-base-200 text-base-content hover:bg-base-300'}`}>
                    Book Now
                  </button>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section class="py-6 bg-base-100 border-b border-base-200 sticky top-16 z-40">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <For each={categories}>
              {(cat) => (
                <button
                  class={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory() === cat.id
                      ? 'bg-primary text-white'
                      : 'bg-base-200 text-base-content hover:bg-base-300'
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span>{cat.icon}</span>
                  <span class="font-medium text-sm">{cat.name}</span>
                </button>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Test List */}
      <section class="py-12 bg-base-100">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-base-content mb-8">
            Popular Lab Tests
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <For each={filteredTests()}>
              {(test) => (
                <div class="p-5 bg-base-100 rounded-2xl border border-base-200 hover:border-primary/30 hover:shadow-lg transition-all">
                  <h3 class="font-semibold text-base-content mb-2">{test.name}</h3>
                  <p class="text-sm text-base-content/60 mb-4 line-clamp-2">{test.description}</p>
                  
                  <div class="flex items-center gap-2 text-xs text-base-content/60 mb-4">
                    <span class="px-2 py-1 bg-base-200 rounded">{test.parameters} parameters</span>
                    <span class="px-2 py-1 bg-base-200 rounded">📄 {test.reportTime}</span>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-xl font-bold text-primary">KES {test.discountedPrice}</span>
                      <span class="text-sm text-base-content/50 line-through ml-2">KES {test.originalPrice}</span>
                    </div>
                  </div>
                  
                  <button class="w-full mt-4 py-2 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-colors">
                    Add to Cart
                  </button>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section class="py-16 bg-base-200/30">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-base-content text-center mb-12">
            How It Works
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl mx-auto mb-4">
                🛒
              </div>
              <h3 class="font-semibold text-base-content mb-2">1. Select Tests</h3>
              <p class="text-sm text-base-content/60">Choose tests or packages that suit your needs</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl mx-auto mb-4">
                📅
              </div>
              <h3 class="font-semibold text-base-content mb-2">2. Book Slot</h3>
              <p class="text-sm text-base-content/60">Choose date, time & address for sample collection</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl mx-auto mb-4">
                🏠
              </div>
              <h3 class="font-semibold text-base-content mb-2">3. Sample Pickup</h3>
              <p class="text-sm text-base-content/60">Our certified phlebotomist visits your home</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl mx-auto mb-4">
                📱
              </div>
              <h3 class="font-semibold text-base-content mb-2">4. Get Reports</h3>
              <p class="text-sm text-base-content/60">Receive digital reports on your phone</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
