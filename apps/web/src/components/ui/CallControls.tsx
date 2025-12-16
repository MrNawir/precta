/**
 * CallControls Component
 * 
 * Premium call control bar for video consultations.
 * Uses DaisyUI button variants with Lucide icons (no emojis).
 * 
 * Features:
 * - Accessible keyboard navigation
 * - ARIA labels for screen readers
 * - Focus ring visibility (WCAG AA)
 * - Touch-friendly sizing (44px minimum)
 * - Glassmorphic backdrop
 * 
 * Usage:
 * ```tsx
 * <CallControls
 *   isAudioMuted={false}
 *   isVideoOff={false}
 *   onToggleAudio={() => {}}
 *   onToggleVideo={() => {}}
 *   onEndCall={() => {}}
 * />
 * ```
 * 
 * References:
 * - User Story 2, Acceptance Scenario 2
 * - DaisyUI Buttons: https://daisyui.com/components/button/
 * - WCAG Focus Visible: https://www.w3.org/WAI/WCAG21/Understanding/focus-visible
 * 
 * @module components/ui/CallControls
 */

import { Show } from 'solid-js';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MoreHorizontal } from 'lucide-solid';

interface CallControlsProps {
  /** Whether audio is currently muted */
  isAudioMuted: boolean;
  /** Whether video is currently off */
  isVideoOff: boolean;
  /** Callback when audio toggle is clicked */
  onToggleAudio: () => void;
  /** Callback when video toggle is clicked */
  onToggleVideo: () => void;
  /** Callback when end call is clicked */
  onEndCall: () => void;
  /** Optional: Callback for screen share */
  onScreenShare?: () => void;
  /** Optional: Callback for more options */
  onMoreOptions?: () => void;
  /** Optional: Additional CSS classes */
  class?: string;
}

/**
 * CallControls Component
 * 
 * Renders the control bar at the bottom of the video call screen.
 * All controls use DaisyUI btn-circle with proper accessibility.
 */
export default function CallControls(props: CallControlsProps) {
  return (
    <div 
      class={`
        bg-neutral/90 backdrop-blur-xl
        border-t border-white/5
        p-6 md:p-8
        ${props.class || ''}
      `}
      role="toolbar"
      aria-label="Call controls"
    >
      <div class="flex items-center justify-center gap-4 md:gap-6">
        {/* Mute/Unmute Audio */}
        <ControlButton
          isActive={props.isAudioMuted}
          activeLabel="Unmute microphone"
          inactiveLabel="Mute microphone"
          onClick={props.onToggleAudio}
          variant={props.isAudioMuted ? 'error' : 'default'}
        >
          <Show when={props.isAudioMuted} fallback={<Mic class="w-6 h-6" />}>
            <MicOff class="w-6 h-6" />
          </Show>
        </ControlButton>

        {/* Toggle Video */}
        <ControlButton
          isActive={props.isVideoOff}
          activeLabel="Turn on camera"
          inactiveLabel="Turn off camera"
          onClick={props.onToggleVideo}
          variant={props.isVideoOff ? 'error' : 'default'}
        >
          <Show when={props.isVideoOff} fallback={<Video class="w-6 h-6" />}>
            <VideoOff class="w-6 h-6" />
          </Show>
        </ControlButton>

        {/* Screen Share (optional) */}
        <Show when={props.onScreenShare}>
          <ControlButton
            isActive={false}
            activeLabel="Stop sharing screen"
            inactiveLabel="Share screen"
            onClick={props.onScreenShare!}
            variant="default"
          >
            <Monitor class="w-6 h-6" />
          </ControlButton>
        </Show>

        {/* End Call - Larger and always visible */}
        <button
          class={`
            btn btn-circle btn-error
            w-16 h-16
            shadow-lg shadow-error/40
            transition-all duration-150
            hover:scale-105
            focus:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:ring-offset-neutral
          `}
          onClick={props.onEndCall}
          aria-label="End call"
          title="End call"
        >
          <PhoneOff class="w-7 h-7" />
        </button>

        {/* More Options (optional) */}
        <Show when={props.onMoreOptions}>
          <ControlButton
            isActive={false}
            activeLabel="Close menu"
            inactiveLabel="More options"
            onClick={props.onMoreOptions!}
            variant="default"
          >
            <MoreHorizontal class="w-6 h-6" />
          </ControlButton>
        </Show>
      </div>

      {/* Help text - hidden on mobile for space */}
      <p class="hidden md:block text-center text-base-content/50 text-sm mt-4">
        End the call when your consultation is complete
      </p>
    </div>
  );
}

/**
 * Individual control button with consistent styling.
 */
interface ControlButtonProps {
  /** Whether the control is in active state (e.g., muted) */
  isActive: boolean;
  /** ARIA label when active */
  activeLabel: string;
  /** ARIA label when inactive */
  inactiveLabel: string;
  /** Click handler */
  onClick: () => void;
  /** Visual variant */
  variant: 'default' | 'error';
  /** Button content (icon) */
  children: any;
}

function ControlButton(props: ControlButtonProps) {
  const ariaLabel = () => props.isActive ? props.activeLabel : props.inactiveLabel;
  
  return (
    <button
      class={`
        btn btn-circle
        w-14 h-14
        transition-all duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral
        ${props.variant === 'error' 
          ? 'btn-error focus-visible:ring-error' 
          : 'bg-base-content/20 hover:bg-base-content/30 border-none text-white focus-visible:ring-primary'
        }
      `}
      onClick={props.onClick}
      aria-label={ariaLabel()}
      aria-pressed={props.isActive}
      title={ariaLabel()}
    >
      {props.children}
    </button>
  );
}

/**
 * Compact version for smaller viewports.
 */
export function CallControlsCompact(props: Omit<CallControlsProps, 'onScreenShare' | 'onMoreOptions'>) {
  return (
    <div 
      class="flex items-center justify-center gap-3 p-4 bg-neutral/90 backdrop-blur-xl"
      role="toolbar"
      aria-label="Call controls"
    >
      <button
        class={`btn btn-circle w-12 h-12 ${props.isAudioMuted ? 'btn-error' : 'bg-base-content/20 border-none text-white'}`}
        onClick={props.onToggleAudio}
        aria-label={props.isAudioMuted ? "Unmute" : "Mute"}
        aria-pressed={props.isAudioMuted}
      >
        <Show when={props.isAudioMuted} fallback={<Mic class="w-5 h-5" />}>
          <MicOff class="w-5 h-5" />
        </Show>
      </button>

      <button
        class={`btn btn-circle w-12 h-12 ${props.isVideoOff ? 'btn-error' : 'bg-base-content/20 border-none text-white'}`}
        onClick={props.onToggleVideo}
        aria-label={props.isVideoOff ? "Turn on camera" : "Turn off camera"}
        aria-pressed={props.isVideoOff}
      >
        <Show when={props.isVideoOff} fallback={<Video class="w-5 h-5" />}>
          <VideoOff class="w-5 h-5" />
        </Show>
      </button>

      <button
        class="btn btn-circle btn-error w-14 h-14 shadow-lg shadow-error/40"
        onClick={props.onEndCall}
        aria-label="End call"
      >
        <PhoneOff class="w-6 h-6" />
      </button>
    </div>
  );
}
