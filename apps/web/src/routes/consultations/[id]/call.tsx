/**
 * T081: Video Call Page
 * Video consultation interface with 100ms
 */

import { Title } from "@solidjs/meta";
import { useParams, useNavigate } from "@solidjs/router";
import { createSignal, createEffect, onCleanup, Show } from "solid-js";
import {
  Video, VideoOff, Mic, MicOff, PhoneOff,
  User, CheckCircle, AlertCircle, Loader2,
  Clock, Shield
} from "lucide-solid";

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

      <div class="min-h-screen bg-gray-900 flex flex-col font-sans">
        <Show when={!loading()} fallback={
          <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <Loader2 class="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p class="text-white mt-4 font-medium">Connecting to consultation...</p>
            </div>
          </div>
        }>
          <Show when={session() && callState() !== 'ended'} fallback={
            <div class="flex-1 flex items-center justify-center">
              <div class="text-center bg-gray-800 p-8 rounded-2xl max-w-sm mx-4">
                <Show when={callState() === 'ended'}>
                  <div class="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle class="w-10 h-10 text-success" />
                  </div>
                  <h2 class="text-2xl font-bold text-white mb-2">Consultation Ended</h2>
                  <p class="text-gray-400">Redirecting to summary...</p>
                </Show>
                <Show when={error()}>
                  <div class="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle class="w-10 h-10 text-error" />
                  </div>
                  <h2 class="text-xl font-bold text-white mb-2">Unable to Connect</h2>
                  <p class="text-gray-400 mb-6">{error()}</p>
                  <button
                    class="btn btn-primary w-full"
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
                      <User class="w-16 h-16 text-gray-500" />
                    </div>
                    <p class="text-gray-400">Video is off</p>
                  </div>
                }>
                  {/* In production, this would be the 100ms video element */}
                  <div class="text-center">
                    <div class="w-48 h-48 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-[0_0_50px_rgba(var(--color-primary),0.3)]">
                      <Video class="w-20 h-20 text-white" />
                    </div>
                    <p class="text-white text-lg font-medium">
                      {session()?.role === 'host' ? 'Waiting for patient...' : 'Connected with doctor'}
                    </p>
                  </div>
                </Show>
              </div>

              {/* Local Video (PiP) */}
              <div class="absolute bottom-6 right-6 w-48 h-36 bg-gray-700 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-600/50">
                <div class="w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <User class="w-12 h-12 text-white/50" />
                </div>
              </div>

              {/* Top Bar */}
              <div class="absolute top-0 left-0 right-0 p-6 bg-linear-to-b from-black/80 to-transparent">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                      <div class="w-2.5 h-2.5 bg-success rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                      <span class="text-white font-medium font-mono text-sm">{formatTime(elapsedTime())}</span>
                    </div>
                    <span class="badge badge-lg border-none bg-white/10 text-white backdrop-blur-md">
                      {session()?.role === 'host' ? 'Doctor' : 'Patient'}
                    </span>
                  </div>

                  <div class="flex items-center gap-2 text-white/70 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs">
                    <Shield class="w-3 h-3" />
                    Encrypted
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div class="bg-gray-900/90 backdrop-blur-xl border-t border-white/5 p-8">
              <div class="flex items-center justify-center gap-8">
                {/* Mute Audio */}
                <button
                  class={`btn btn-circle btn-xl w-14 h-14 ${isAudioMuted() ? 'btn-error' : 'bg-gray-700 hover:bg-gray-600 border-none text-white'}`}
                  onClick={toggleAudio}
                >
                  <Show when={isAudioMuted()} fallback={<Mic class="w-6 h-6" />}>
                    <MicOff class="w-6 h-6" />
                  </Show>
                </button>

                {/* Toggle Video */}
                <button
                  class={`btn btn-circle btn-xl w-14 h-14 ${isVideoOff() ? 'btn-error' : 'bg-gray-700 hover:bg-gray-600 border-none text-white'}`}
                  onClick={toggleVideo}
                >
                  <Show when={isVideoOff()} fallback={<Video class="w-6 h-6" />}>
                    <VideoOff class="w-6 h-6" />
                  </Show>
                </button>

                {/* End Call */}
                <button
                  class="btn btn-circle btn-xl w-16 h-16 btn-error shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                  onClick={endCall}
                >
                  <PhoneOff class="w-8 h-8" />
                </button>
              </div>

              <p class="text-center text-gray-500 text-sm mt-6 font-medium">
                End the call when your consultation is complete
              </p>
            </div>
          </Show>
        </Show>
      </div>
    </>
  );
}
