/**
 * T083: VideoRoom Component
 * Video consultation room with 100ms SDK integration
 */

import { createSignal, createEffect, onCleanup, Show, For } from "solid-js";

export interface VideoRoomProps {
  roomId: string;
  token: string;
  role: 'host' | 'guest';
  userName: string;
  onLeave?: () => void;
  onError?: (error: Error) => void;
}

interface Participant {
  id: string;
  name: string;
  isLocal: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export default function VideoRoom(props: VideoRoomProps) {
  const [isConnected, setIsConnected] = createSignal(false);
  const [isConnecting, setIsConnecting] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [participants, setParticipants] = createSignal<Participant[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = createSignal(true);
  const [isVideoEnabled, setIsVideoEnabled] = createSignal(true);
  const [isScreenSharing, setIsScreenSharing] = createSignal(false);

  // In production, this would use the actual 100ms SDK
  // import { HMSReactiveStore, selectPeers, selectIsConnectedToRoom } from '@100mslive/hms-video-store';

  // Simulate connection
  createEffect(() => {
    const connectToRoom = async () => {
      try {
        setIsConnecting(true);
        
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock connection success
        setIsConnected(true);
        setIsConnecting(false);

        // Add local participant
        setParticipants([
          {
            id: 'local',
            name: props.userName,
            isLocal: true,
            audioEnabled: true,
            videoEnabled: true,
          },
        ]);

        // Simulate remote participant joining after delay (in production, this comes from 100ms events)
        setTimeout(() => {
          setParticipants(prev => [
            ...prev,
            {
              id: 'remote',
              name: props.role === 'host' ? 'Patient' : 'Doctor',
              isLocal: false,
              audioEnabled: true,
              videoEnabled: true,
            },
          ]);
        }, 3000);

      } catch (err) {
        setError('Failed to connect to video room');
        setIsConnecting(false);
        props.onError?.(err instanceof Error ? err : new Error('Connection failed'));
      }
    };

    if (props.token && props.roomId) {
      connectToRoom();
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    // Would disconnect from 100ms here
  });

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled());
    // Would toggle actual audio track here
    setParticipants(prev =>
      prev.map(p =>
        p.isLocal ? { ...p, audioEnabled: !p.audioEnabled } : p
      )
    );
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled());
    // Would toggle actual video track here
    setParticipants(prev =>
      prev.map(p =>
        p.isLocal ? { ...p, videoEnabled: !p.videoEnabled } : p
      )
    );
  };

  const toggleScreenShare = async () => {
    setIsScreenSharing(!isScreenSharing());
    // Would start/stop screen sharing here
  };

  const leaveRoom = () => {
    // Would disconnect from 100ms here
    setIsConnected(false);
    props.onLeave?.();
  };

  const remoteParticipant = () => participants().find(p => !p.isLocal);
  const localParticipant = () => participants().find(p => p.isLocal);

  return (
    <div class="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden">
      {/* Connecting State */}
      <Show when={isConnecting()}>
        <div class="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div class="text-center">
            <span class="loading loading-spinner loading-lg text-primary"></span>
            <p class="text-white mt-4">Connecting to room...</p>
            <p class="text-gray-500 text-sm mt-2">Room: {props.roomId.slice(0, 12)}...</p>
          </div>
        </div>
      </Show>

      {/* Error State */}
      <Show when={error()}>
        <div class="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div class="text-center">
            <div class="text-5xl mb-4">⚠️</div>
            <p class="text-white font-medium">{error()}</p>
            <button class="btn btn-primary mt-4" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </Show>

      {/* Connected State */}
      <Show when={isConnected() && !error()}>
        {/* Main Video Area - Remote Participant */}
        <div class="absolute inset-0">
          <Show when={remoteParticipant()} fallback={
            <div class="w-full h-full flex items-center justify-center bg-gray-800">
              <div class="text-center">
                <div class="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-5xl">👤</span>
                </div>
                <p class="text-gray-400">Waiting for {props.role === 'host' ? 'patient' : 'doctor'} to join...</p>
              </div>
            </div>
          }>
            <div class="w-full h-full bg-gray-800 flex items-center justify-center">
              <Show when={remoteParticipant()?.videoEnabled} fallback={
                <div class="text-center">
                  <div class="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                    <span class="text-5xl">👤</span>
                  </div>
                  <p class="text-white mt-4">{remoteParticipant()?.name}</p>
                  <p class="text-gray-500 text-sm">Camera off</p>
                </div>
              }>
                {/* In production, this would be the actual video element */}
                <div class="w-full h-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div class="text-center">
                    <div class="w-48 h-48 bg-primary/30 rounded-full flex items-center justify-center animate-pulse">
                      <span class="text-8xl">📹</span>
                    </div>
                    <p class="text-white mt-4 text-lg">{remoteParticipant()?.name}</p>
                  </div>
                </div>
              </Show>
            </div>
          </Show>

          {/* Remote participant indicator */}
          <Show when={remoteParticipant()}>
            <div class="absolute top-4 left-4 flex items-center gap-2 bg-black/50 rounded-lg px-3 py-2">
              <Show when={!remoteParticipant()?.audioEnabled}>
                <span class="text-error text-sm">🔇</span>
              </Show>
              <span class="text-white text-sm">{remoteParticipant()?.name}</span>
            </div>
          </Show>
        </div>

        {/* Local Video (PiP) */}
        <div class="absolute bottom-24 right-4 w-48 h-36 bg-gray-700 rounded-xl overflow-hidden shadow-lg border-2 border-gray-600">
          <Show when={isVideoEnabled()} fallback={
            <div class="w-full h-full flex items-center justify-center bg-gray-800">
              <div class="text-center">
                <span class="text-3xl">👤</span>
                <p class="text-gray-400 text-xs mt-1">Camera off</p>
              </div>
            </div>
          }>
            {/* In production, this would be the local video */}
            <div class="w-full h-full bg-linear-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <span class="text-4xl">📷</span>
            </div>
          </Show>
          
          {/* Local name badge */}
          <div class="absolute bottom-2 left-2 bg-black/50 rounded px-2 py-1">
            <span class="text-white text-xs">You</span>
          </div>

          {/* Audio indicator */}
          <Show when={!isAudioEnabled()}>
            <div class="absolute top-2 right-2 bg-error rounded-full p-1">
              <span class="text-xs">🔇</span>
            </div>
          </Show>
        </div>

        {/* Controls */}
        <div class="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent">
          <div class="flex items-center justify-center gap-4">
            {/* Mute/Unmute */}
            <button
              class={`btn btn-circle btn-lg ${!isAudioEnabled() ? 'btn-error' : 'btn-ghost border-2 border-gray-500'}`}
              onClick={toggleAudio}
              title={isAudioEnabled() ? 'Mute' : 'Unmute'}
            >
              <Show when={isAudioEnabled()} fallback={
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              }>
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </Show>
            </button>

            {/* Video On/Off */}
            <button
              class={`btn btn-circle btn-lg ${!isVideoEnabled() ? 'btn-error' : 'btn-ghost border-2 border-gray-500'}`}
              onClick={toggleVideo}
              title={isVideoEnabled() ? 'Turn off camera' : 'Turn on camera'}
            >
              <Show when={isVideoEnabled()} fallback={
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }>
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Show>
            </button>

            {/* Screen Share */}
            <button
              class={`btn btn-circle btn-lg ${isScreenSharing() ? 'btn-success' : 'btn-ghost border-2 border-gray-500'}`}
              onClick={toggleScreenShare}
              title={isScreenSharing() ? 'Stop sharing' : 'Share screen'}
            >
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Leave */}
            <button
              class="btn btn-circle btn-lg btn-error"
              onClick={leaveRoom}
              title="Leave call"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
            </button>
          </div>

          {/* Participants count */}
          <div class="flex justify-center mt-4">
            <div class="flex items-center gap-2 text-gray-400 text-sm">
              <span class="w-2 h-2 bg-success rounded-full animate-pulse"></span>
              {participants().length} participant{participants().length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
