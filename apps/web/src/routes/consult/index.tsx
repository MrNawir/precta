/**
 * Online Consultation Page - Instant video consultation
 */

import { Title } from "@solidjs/meta";
import { For, createSignal, Show } from "solid-js";
import { useSearchParams } from "@solidjs/router";

export default function ConsultPage() {
  const [searchParams] = useSearchParams();
  const [selectedSpecialty, setSelectedSpecialty] = createSignal(searchParams.concern || "");

  const specialties = [
    { id: "general", name: "General Physician", icon: "🩺", fee: 500, waitTime: "< 2 min" },
    { id: "gynecology", name: "Gynecology", icon: "👩‍⚕️", fee: 700, waitTime: "< 5 min" },
    { id: "dermatology", name: "Dermatology", icon: "🧴", fee: 600, waitTime: "< 3 min" },
    { id: "pediatrics", name: "Pediatrics", icon: "👶", fee: 600, waitTime: "< 5 min" },
    { id: "psychiatry", name: "Psychiatry", icon: "🧠", fee: 1000, waitTime: "< 10 min" },
    { id: "gastroenterology", name: "Gastroenterology", icon: "🤢", fee: 800, waitTime: "< 5 min" },
    { id: "cardiology", name: "Cardiology", icon: "❤️", fee: 1000, waitTime: "< 10 min" },
    { id: "orthopedics", name: "Orthopedics", icon: "🦴", fee: 800, waitTime: "< 5 min" },
    { id: "ent", name: "ENT", icon: "👂", fee: 600, waitTime: "< 5 min" },
    { id: "ophthalmology", name: "Ophthalmology", icon: "👁️", fee: 700, waitTime: "< 5 min" },
    { id: "urology", name: "Urology", icon: "🫀", fee: 800, waitTime: "< 10 min" },
    { id: "sexology", name: "Sexology", icon: "💑", fee: 700, waitTime: "< 5 min" },
  ];

  const healthConcerns = [
    { name: "Period doubts or Pregnancy", icon: "🤰", specialty: "gynecology" },
    { name: "Acne, pimple or skin issues", icon: "🧴", specialty: "dermatology" },
    { name: "Cold, cough or fever", icon: "🤒", specialty: "general" },
    { name: "Child not feeling well", icon: "👶", specialty: "pediatrics" },
    { name: "Depression or anxiety", icon: "🧠", specialty: "psychiatry" },
    { name: "Stomach pain or digestion", icon: "🤢", specialty: "gastroenterology" },
    { name: "Heart or BP issues", icon: "❤️", specialty: "cardiology" },
    { name: "Joint or bone pain", icon: "🦴", specialty: "orthopedics" },
    { name: "Ear, nose or throat", icon: "👂", specialty: "ent" },
    { name: "Eye problems", icon: "👁️", specialty: "ophthalmology" },
    { name: "Urinary issues", icon: "🫀", specialty: "urology" },
    { name: "Sexual health", icon: "💑", specialty: "sexology" },
  ];

  const benefits = [
    { icon: "⚡", title: "Instant Connection", description: "Connect with a doctor in under 60 seconds" },
    { icon: "🔒", title: "100% Private", description: "Secure, encrypted video consultations" },
    { icon: "💊", title: "Digital Prescription", description: "Get prescriptions sent to your phone" },
    { icon: "📋", title: "Free Follow-up", description: "3-day free follow-up with same doctor" },
    { icon: "💳", title: "Pay via M-Pesa", description: "Easy payment with M-Pesa or card" },
    { icon: "🏆", title: "Verified Doctors", description: "All doctors are licensed professionals" },
  ];

  const testimonials = [
    { name: "Mary K.", location: "Nairobi", text: "Got connected to a doctor within a minute. The prescription was sent instantly!", rating: 5 },
    { name: "John M.", location: "Mombasa", text: "My child had a fever at midnight. Precta saved us from going to the ER.", rating: 5 },
    { name: "Grace O.", location: "Kisumu", text: "Very professional doctors. I've been using it for all my family's needs.", rating: 5 },
  ];

  return (
    <>
      <Title>Online Doctor Consultation | Precta</Title>

      {/* Hero Section */}
      <section class="bg-gradient-to-br from-cyan-500 to-blue-600 text-white py-16">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
                <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                500+ doctors online now
              </div>
              
              <h1 class="text-4xl sm:text-5xl font-bold mb-6">
                Instant Video Consultation
              </h1>
              <p class="text-xl text-white/80 mb-8">
                Skip the queue. Consult with verified doctors from your home in under 60 seconds. 
                Available 24/7.
              </p>
              
              <div class="flex flex-wrap gap-4 mb-8">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>No booking fee</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>3-day free follow-up</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Digital prescription</span>
                </div>
              </div>

              <a 
                href="#specialties" 
                class="inline-flex items-center gap-2 px-8 py-4 bg-white text-cyan-600 font-semibold rounded-2xl hover:bg-gray-100 transition-colors shadow-xl"
              >
                Consult Now — Starts at KES 500
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
            
            {/* Stats Card */}
            <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
              <div class="grid grid-cols-2 gap-6">
                <div class="text-center">
                  <div class="text-4xl font-bold mb-2">500+</div>
                  <div class="text-white/70 text-sm">Doctors Online</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold mb-2">&lt;60s</div>
                  <div class="text-white/70 text-sm">Avg Wait Time</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold mb-2">50K+</div>
                  <div class="text-white/70 text-sm">Consultations</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold mb-2">4.8★</div>
                  <div class="text-white/70 text-sm">Patient Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Health Concerns Quick Access */}
      <section class="py-12 bg-base-100 border-b border-base-200">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-xl font-bold text-base-content mb-6">
            What's your health concern?
          </h2>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <For each={healthConcerns}>
              {(concern) => (
                <button
                  class={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all ${
                    selectedSpecialty() === concern.specialty 
                      ? 'border-primary bg-primary/5' 
                      : 'border-base-200 hover:border-primary/30'
                  }`}
                  onClick={() => setSelectedSpecialty(concern.specialty)}
                >
                  <span class="text-3xl mb-2">{concern.icon}</span>
                  <span class="text-sm font-medium text-base-content">{concern.name}</span>
                </button>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Specialties Grid */}
      <section id="specialties" class="py-12 bg-base-200/30">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-base-content mb-8">
            Choose a Specialty
          </h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <For each={specialties}>
              {(specialty) => (
                <div 
                  class={`p-6 bg-base-100 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                    selectedSpecialty() === specialty.id 
                      ? 'border-primary' 
                      : 'border-transparent hover:border-primary/30'
                  }`}
                  onClick={() => setSelectedSpecialty(specialty.id)}
                >
                  <div class="flex items-center gap-4 mb-4">
                    <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
                      {specialty.icon}
                    </div>
                    <div>
                      <h3 class="font-semibold text-base-content">{specialty.name}</h3>
                      <p class="text-sm text-success">{specialty.waitTime} wait</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-2xl font-bold text-primary">KES {specialty.fee}</span>
                    </div>
                    <button class="px-4 py-2 gradient-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
                      Consult
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section class="py-16 bg-base-100">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-base-content text-center mb-12">
            Why Consult Online with Precta?
          </h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <For each={benefits}>
              {(benefit) => (
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 class="font-semibold text-base-content mb-1">{benefit.title}</h3>
                    <p class="text-sm text-base-content/60">{benefit.description}</p>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section class="py-16 bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-center mb-12">
            3 Simple Steps to Consult
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 class="font-semibold mb-2">Select Specialty</h3>
              <p class="text-white/70 text-sm">Choose from 25+ specialties based on your health concern</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 class="font-semibold mb-2">Pay & Connect</h3>
              <p class="text-white/70 text-sm">Secure payment via M-Pesa or card. Connect instantly.</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 class="font-semibold mb-2">Get Treatment</h3>
              <p class="text-white/70 text-sm">Receive diagnosis, prescription & follow-up digitally</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section class="py-16 bg-base-100">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-base-content text-center mb-12">
            What Patients Say
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <For each={testimonials}>
              {(testimonial) => (
                <div class="p-6 bg-base-200/50 rounded-2xl">
                  <div class="flex gap-1 mb-4">
                    <For each={Array(testimonial.rating).fill(0)}>
                      {() => (
                        <svg class="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                    </For>
                  </div>
                  <p class="text-base-content/80 mb-4">"{testimonial.text}"</p>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <div class="font-medium text-base-content">{testimonial.name}</div>
                      <div class="text-sm text-base-content/60">{testimonial.location}</div>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="py-16 bg-base-200/30">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="max-w-2xl mx-auto text-center">
            <h2 class="text-3xl font-bold text-base-content mb-4">
              Ready to Consult?
            </h2>
            <p class="text-base-content/70 mb-8">
              Get instant access to Kenya's top doctors. No more waiting rooms.
            </p>
            <a 
              href="#specialties" 
              class="inline-flex items-center gap-2 px-8 py-4 gradient-primary text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
            >
              Start Consultation — KES 500
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
