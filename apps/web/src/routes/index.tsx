import { Title } from "@solidjs/meta";
import { For, createSignal } from "solid-js";

export default function Home() {
  const [location, setLocation] = createSignal("Nairobi");
  const [searchQuery, setSearchQuery] = createSignal("");

  // Main service cards like Practo
  const mainServices = [
    {
      title: "Instant Video Consultation",
      description: "Connect within 60 secs",
      icon: "📱",
      href: "/consult",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&h=200&fit=crop",
      color: "from-cyan-500 to-blue-600",
    },
    {
      title: "Find Doctors Near You",
      description: "Confirmed appointments",
      icon: "👨‍⚕️",
      href: "/doctors",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=200&fit=crop",
      color: "from-teal-500 to-cyan-600",
    },
    {
      title: "Lab Tests",
      description: "Safe and trusted lab tests",
      icon: "🧪",
      href: "/lab-tests",
      image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=300&h=200&fit=crop",
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Surgeries",
      description: "Safe and trusted surgery centers",
      icon: "🏥",
      href: "/surgeries",
      image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=300&h=200&fit=crop",
      color: "from-orange-500 to-red-600",
    },
  ];

  // Quick health concerns like Practo
  const healthConcerns = [
    { name: "Period doubts or Pregnancy", icon: "🤰", specialty: "Gynecology" },
    { name: "Acne, pimple or skin issues", icon: "🧴", specialty: "Dermatology" },
    { name: "Cold, cough or fever", icon: "🤒", specialty: "General Practice" },
    { name: "Child not feeling well", icon: "👶", specialty: "Pediatrics" },
    { name: "Depression or anxiety", icon: "🧠", specialty: "Psychiatry" },
    { name: "Stomach pain or digestion", icon: "🤢", specialty: "Gastroenterology" },
  ];

  // Specialties for in-clinic appointments
  const specialties = [
    { name: "Dentist", icon: "🦷", doctors: 95 },
    { name: "Gynecologist", icon: "👩‍⚕️", doctors: 64 },
    { name: "Dietitian", icon: "🥗", doctors: 45 },
    { name: "Physiotherapist", icon: "💪", doctors: 38 },
    { name: "General Surgeon", icon: "🔪", doctors: 42 },
    { name: "Orthopedist", icon: "🦴", doctors: 35 },
    { name: "Pediatrician", icon: "👶", doctors: 85 },
    { name: "Cardiologist", icon: "❤️", doctors: 42 },
  ];

  // Stats
  const stats = [
    { value: "50,000+", label: "Patients Served" },
    { value: "500+", label: "Verified Doctors" },
    { value: "20+", label: "Cities Covered" },
    { value: "98%", label: "Satisfaction Rate" },
  ];

  // For corporates
  const corporateFeatures = [
    { title: "Employee Health Plans", description: "Customized healthcare packages for your team" },
    { title: "Mental Wellness Programs", description: "Counseling and support services" },
    { title: "Annual Health Checkups", description: "Comprehensive screening packages" },
    { title: "On-site Medical Support", description: "Doctors at your workplace" },
  ];

  return (
    <>
      <Title>Precta - Kenya's Leading Healthcare Platform</Title>
      
      {/* Search Hero - Like Practo */}
      <section class="bg-base-100 border-b border-base-200">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex flex-col md:flex-row gap-4 items-center">
            {/* Location Selector */}
            <div class="flex items-center gap-2 px-4 py-3 bg-base-200 rounded-xl min-w-[180px]">
              <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <select 
                class="bg-transparent font-medium text-base-content focus:outline-none cursor-pointer"
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
            
            {/* Search Input */}
            <div class="flex-1 relative w-full">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search doctors, clinics, hospitals, etc."
                class="w-full pl-12 pr-4 py-3 bg-base-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Services Grid - Like Practo */}
      <section class="py-12 bg-base-100">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <For each={mainServices}>
              {(service) => (
                <a 
                  href={service.href}
                  class="group relative overflow-hidden rounded-3xl bg-base-200 aspect-4/3 flex flex-col justify-end p-6 hover:shadow-2xl transition-all"
                >
                  {/* Background Image */}
                  <div class="absolute inset-0">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"></div>
                  </div>
                  
                  {/* Content */}
                  <div class="relative z-10 text-white">
                    <h3 class="text-xl font-bold mb-1">{service.title}</h3>
                    <p class="text-white/80 text-sm">{service.description}</p>
                  </div>
                </a>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Quick Health Concerns - Like Practo */}
      <section class="py-16 bg-base-200/50">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between mb-10">
            <div>
              <h2 class="text-2xl sm:text-3xl font-bold text-base-content">
                Consult top doctors online for any health concern
              </h2>
              <p class="text-base-content/60 mt-2">Private online consultations with verified doctors in all specialties</p>
            </div>
            <a href="/doctors" class="hidden sm:inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-colors">
              View All Specialties
            </a>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            <For each={healthConcerns}>
              {(concern) => (
                <a 
                  href={`/consult?concern=${encodeURIComponent(concern.name)}`}
                  class="group flex flex-col items-center text-center p-6 bg-base-100 rounded-2xl hover:shadow-lg transition-all"
                >
                  <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl mb-4 group-hover:bg-primary/20 transition-colors">
                    {concern.icon}
                  </div>
                  <h3 class="font-medium text-base-content text-sm mb-2">{concern.name}</h3>
                  <span class="text-primary font-semibold text-sm">CONSULT NOW</span>
                </a>
              )}
            </For>
          </div>
          
          <div class="text-center mt-8 sm:hidden">
            <a href="/doctors" class="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-semibold rounded-xl">
              View All Specialties
            </a>
          </div>
        </div>
      </section>

      {/* In-Clinic Appointments - Like Practo */}
      <section class="py-16 bg-base-100">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="mb-10">
            <h2 class="text-2xl sm:text-3xl font-bold text-base-content">
              Book an appointment for an in-clinic consultation
            </h2>
            <p class="text-base-content/60 mt-2">Find experienced doctors across all specialties</p>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            <For each={specialties}>
              {(specialty) => (
                <a 
                  href={`/doctors?specialty=${encodeURIComponent(specialty.name)}`}
                  class="group flex flex-col items-center text-center p-4 rounded-2xl hover:bg-base-200 transition-colors"
                >
                  <div class="w-16 h-16 rounded-full bg-base-200 group-hover:bg-primary/10 flex items-center justify-center text-3xl mb-3 transition-colors">
                    {specialty.icon}
                  </div>
                  <h3 class="font-medium text-base-content text-sm">{specialty.name}</h3>
                  <p class="text-xs text-base-content/50 mt-1">{specialty.doctors} doctors</p>
                </a>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section class="py-12 gradient-hero text-white">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            <For each={stats}>
              {(stat) => (
                <div class="text-center">
                  <div class="text-3xl sm:text-4xl font-bold mb-1">{stat.value}</div>
                  <div class="text-sm text-white/70">{stat.label}</div>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* For Corporates Section */}
      <section class="py-16 bg-base-200/30">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="max-w-4xl mx-auto text-center mb-12">
            <span class="inline-block px-4 py-1 bg-accent/10 text-accent font-semibold rounded-full text-sm mb-4">
              FOR CORPORATES
            </span>
            <h2 class="text-3xl sm:text-4xl font-bold text-base-content mb-4">
              Healthcare Solutions for Your Business
            </h2>
            <p class="text-base-content/70">
              Comprehensive healthcare packages designed for organizations of all sizes
            </p>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <For each={corporateFeatures}>
              {(feature) => (
                <div class="p-6 bg-base-100 rounded-2xl border border-base-200 hover:border-primary/30 hover:shadow-lg transition-all">
                  <h3 class="font-semibold text-base-content mb-2">{feature.title}</h3>
                  <p class="text-sm text-base-content/60">{feature.description}</p>
                </div>
              )}
            </For>
          </div>
          
          <div class="text-center mt-10">
            <a href="/for-corporates" class="inline-flex items-center gap-2 px-8 py-4 gradient-primary text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
              Learn More
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Download App CTA */}
      <section class="py-16 bg-base-100">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="max-w-5xl mx-auto bg-linear-to-r from-primary to-secondary rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div class="flex-1">
                <h2 class="text-2xl sm:text-3xl font-bold mb-4">
                  Download the Precta App
                </h2>
                <p class="text-white/80 mb-6">
                  Book appointments, consult doctors, order medicines and manage your health—all from your phone.
                </p>
                <div class="flex flex-wrap gap-4">
                  <a href="#" class="inline-flex items-center gap-3 px-6 py-3 bg-black rounded-xl hover:bg-black/80 transition-colors">
                    <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <div class="text-left">
                      <div class="text-xs text-white/70">Download on the</div>
                      <div class="font-semibold">App Store</div>
                    </div>
                  </a>
                  <a href="#" class="inline-flex items-center gap-3 px-6 py-3 bg-black rounded-xl hover:bg-black/80 transition-colors">
                    <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                    </svg>
                    <div class="text-left">
                      <div class="text-xs text-white/70">Get it on</div>
                      <div class="font-semibold">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>
              
              <div class="hidden md:block">
                <div class="w-48 h-48 bg-white/20 rounded-3xl flex items-center justify-center">
                  <span class="text-6xl">📱</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section class="py-16 bg-base-200/30">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="max-w-4xl mx-auto text-center">
            <div class="flex justify-center gap-1 mb-6">
              <For each={[1,2,3,4,5]}>
                {() => (
                  <svg class="w-8 h-8 text-warning" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
              </For>
            </div>
            <blockquote class="text-2xl sm:text-3xl font-medium text-base-content mb-8 leading-relaxed">
              "Precta made it so easy to find a specialist for my mother. We booked a video consultation 
              within minutes and got the care we needed without traveling to Nairobi."
            </blockquote>
            <div class="flex items-center justify-center gap-4">
              <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                JM
              </div>
              <div class="text-left">
                <div class="font-semibold text-base-content">Jane Muthoni</div>
                <div class="text-sm text-base-content/60">Mombasa, Kenya</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
