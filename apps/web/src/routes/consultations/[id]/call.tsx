/**
 * T081: Video Call Page
 * Video consultation interface with 100ms
 */

import { Title } from "@solidjs/meta";
import { useParams, useNavigate } from "@solidjs/router";
import { createSignal, createEffect, onCleanup, Show } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ConsultationSession {
  id: string;
  appointmentId: string;
  roomId: string;
  token: string;
  doctorId: string;
  patientId: string;
  role: 'host' | 'guest';
  status: string;
}

export default function VideoCallPage() {
  const params = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = createSignal<ConsultationSession | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [callState, setCallState] = createSignal<'connecting' | 'connected' | 'ended'>('connecting');
  const [isAudioMuted, setIsAudioMuted] = createSignal(false);
  const [isVideoOff, setIsVideoOff] = createSignal(false);
  const [elapsedTime, setElapsedTime] = createSignal(0);

  let timerInterval: ReturnType<typeof setInterval>;

  // Fetch session
  createEffect(async () => {
    if (!params.id) return;

    try {
      const response = await fetch(
        `${API_URL}/api/v1/consultations/${params.id}/session`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        setSession(data.data);
        setCallState('connected');
        
        // Start timer
        timerInterval = setInterval(() => {
          setElapsedTime(t => t + 1);
        }, 1000);
      } else {
        setError(data.error || 'Failed to join consultation');
      }
    } catch (e) {
      setError('Failed to connect to consultation');
    } finally {
      setLoading(false);
    }
  });

  // Cleanup timer
  onCleanup(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleAudio = () => {
    setIsAudioMuted(!isAudioMuted());
    // Would toggle actual audio track here with 100ms SDK
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff());
    // Would toggle actual video track here with 100ms SDK
  };

  const endCall = async () => {
    try {
      await fetch(`${API_URL}/api/v1/consultations/${params.id}/end`, {
        method: 'POST',
        credentials: 'include',
      });
      
      setCallState('ended');
      
      // Redirect to summary after short delay
      setTimeout(() => {
        navigate(`/consultations/${params.id}`);
      }, 2000);
    } catch (e) {
      console.error('Failed to end call:', e);
    }
  };

  return (
    <>
      <Title>Video Consultation | Precta</Title>

      <div class="min-h-screen bg-gray-900 flex flex-col">
        <Show when={!loading()} fallback={
          <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <span class="loading loading-spinner loading-lg text-primary"></span>
              <p class="text-white mt-4">Connecting to consultation...</p>
            </div>
          </div>
        }>
          <Show when={session() && callState() !== 'ended'} fallback={
            <div class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <Show when={callState() === 'ended'}>
                  <div class="text-6xl mb-4">✅</div>
                  <h2 class="text-2xl font-bold text-white mb-2">Consultation Ended</h2>
                  <p class="text-gray-400">Redirecting to summary...</p>
                </Show>
                <Show when={error()}>
                  <div class="text-6xl mb-4">😕</div>
                  <h2 class="text-xl font-bold text-white mb-2">Unable to Connect</h2>
                  <p class="text-gray-400">{error()}</p>
                  <button 
                    class="btn btn-primary mt-4"
                    onClick={() => navigate('/appointments/my')}
                  >
                    Back to Appointments
                  </button>
                </Show>
              </div>
            </div>
          }>
            {/* Video Area */}
            <div class="flex-1 relative">
              {/* Remote Video (Large) */}
              <div class="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <Show when={!isVideoOff()} fallback={
                  <div class="text-center">
                    <div class="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span class="text-6xl">👤</span>
                    </div>
                    <p class="text-gray-400">Video is off</p>
                  </div>
                }>
                  {/* In production, this would be the 100ms video element */}
                  <div class="text-center">
                    <div class="w-48 h-48 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <span class="text-8xl">📹</span>
                    </div>
                    <p class="text-white text-lg">
                      {session()?.role === 'host' ? 'Waiting for patient...' : 'Connected with doctor'}
                    </p>
                  </div>
                </Show>
              </div>

              {/* Local Video (PiP) */}
              <div class="absolute bottom-24 right-4 w-48 h-36 bg-gray-700 rounded-xl overflow-hidden shadow-lg border-2 border-gray-600">
                <div class="w-full h-full flex items-center justify-center">
                  <span class="text-4xl">👤</span>
                </div>
              </div>

              {/* Top Bar */}
              <div class="absolute top-0 left-0 right-0 p-4 bg-linear-to-b from-black/50 to-transparent">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <span class="text-white font-medium">{formatTime(elapsedTime())}</span>
                    </div>
                    <span class="badge badge-ghost text-white">
                      {session()?.role === 'host' ? 'Doctor' : 'Patient'}
                    </span>
                  </div>
                  
                  <div class="text-white text-sm opacity-70">
                    Room: {session()?.roomId?.slice(0, 8)}...
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div class="bg-gray-800 p-6">
              <div class="flex items-center justify-center gap-6">
                {/* Mute Audio */}
                <button
                  class={`btn btn-circle btn-lg ${isAudioMuted() ? 'btn-error' : 'btn-ghost border-2 border-gray-600 text-white'}`}
                  onClick={toggleAudio}
                >
                  <Show when={isAudioMuted()} fallback={
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  }>
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  </Show>
                </button>

                {/* Toggle Video */}
                <button
                  class={`btn btn-circle btn-lg ${isVideoOff() ? 'btn-error' : 'btn-ghost border-2 border-gray-600 text-white'}`}
                  onClick={toggleVideo}
                >
                  <Show when={isVideoOff()} fallback={
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  }>
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Show>
                </button>

                {/* End Call */}
                <button
                  class="btn btn-circle btn-lg btn-error"
                  onClick={endCall}
                >
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                  </svg>
                </button>
              </div>

              <p class="text-center text-gray-500 text-sm mt-4">
                End the call when your consultation is complete
              </p>
            </div>
          </Show>
        </Show>
      </div>
    </>
  );
}
