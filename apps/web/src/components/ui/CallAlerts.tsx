/**
 * CallAlerts Component
 * 
 * Status and alert banners for video consultations.
 * Uses Lucide icons and DaisyUI alert variants (no emojis).
 * 
 * Features:
 * - ARIA live regions for screen reader announcements
 * - Lucide iconography throughout
 * - Contextual colors (info, warning, error, success)
 * - Auto-dismiss capability
 * - Audit context integration
 * 
 * Usage:
 * ```tsx
 * <CallAlerts
 *   alerts={[
 *     { type: 'warning', message: 'Microphone is muted', icon: 'mic-off' }
 *   ]}
 * />
 * ```
 * 
 * References:
 * - User Story 2, Acceptance Scenario 3
 * - DaisyUI Alerts: https://daisyui.com/components/alert/
 * - WCAG Status Messages: https://www.w3.org/WAI/WCAG21/Understanding/status-messages
 * 
 * @module components/ui/CallAlerts
 */

import { For, Show, createSignal, onCleanup } from 'solid-js';
import {
  AlertCircle, AlertTriangle, CheckCircle, Info,
  MicOff, VideoOff, Wifi, WifiOff,
  Shield, Clock, X
} from 'lucide-solid';

/**
 * Alert type definitions.
 */
export type AlertType = 'info' | 'warning' | 'error' | 'success';

export interface CallAlert {
  /** Unique identifier */
  id: string;
  /** Alert severity type */
  type: AlertType;
  /** Display message */
  message: string;
  /** Optional icon override (Lucide icon name) */
  icon?: 'mic-off' | 'video-off' | 'wifi' | 'wifi-off' | 'shield' | 'clock';
  /** Auto-dismiss after ms (optional) */
  dismissAfter?: number;
  /** Whether alert can be manually dismissed */
  dismissible?: boolean;
}

interface CallAlertsProps {
  /** Array of alerts to display */
  alerts: CallAlert[];
  /** Callback when an alert is dismissed */
  onDismiss?: (id: string) => void;
  /** Position on screen */
  position?: 'top' | 'bottom';
  /** Additional CSS classes */
  class?: string;
}

/**
 * Icon mapping for specific alert contexts.
 */
const ICON_MAP = {
  'mic-off': MicOff,
  'video-off': VideoOff,
  'wifi': Wifi,
  'wifi-off': WifiOff,
  'shield': Shield,
  'clock': Clock,
};

/**
 * Default icons by alert type.
 */
const DEFAULT_ICONS = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle,
};

/**
 * DaisyUI alert class mapping.
 */
const ALERT_CLASSES = {
  info: 'alert-info',
  warning: 'alert-warning',
  error: 'alert-error',
  success: 'alert-success',
};

/**
 * CallAlerts Component
 * 
 * Renders a stack of contextual alerts for the call interface.
 */
export default function CallAlerts(props: CallAlertsProps) {
  const positionClass = () => 
    props.position === 'bottom' 
      ? 'bottom-24 left-4 right-4' 
      : 'top-20 left-4 right-4';

  return (
    <div 
      class={`
        fixed ${positionClass()}
        z-50 flex flex-col gap-2
        pointer-events-none
        ${props.class || ''}
      `}
      role="region"
      aria-label="Call status alerts"
    >
      <For each={props.alerts}>
        {(alert) => (
          <AlertItem 
            alert={alert} 
            onDismiss={props.onDismiss} 
          />
        )}
      </For>
    </div>
  );
}

/**
 * Individual alert item component.
 */
function AlertItem(props: { alert: CallAlert; onDismiss?: (id: string) => void }) {
  const [isVisible, setIsVisible] = createSignal(true);

  // Auto-dismiss timer
  if (props.alert.dismissAfter) {
    const timer = setTimeout(() => {
      setIsVisible(false);
      props.onDismiss?.(props.alert.id);
    }, props.alert.dismissAfter);

    onCleanup(() => clearTimeout(timer));
  }

  // Get the appropriate icon component
  const getIcon = () => {
    if (props.alert.icon && ICON_MAP[props.alert.icon]) {
      const Icon = ICON_MAP[props.alert.icon];
      return <Icon class="w-5 h-5 shrink-0" aria-hidden="true" />;
    }
    const DefaultIcon = DEFAULT_ICONS[props.alert.type];
    return <DefaultIcon class="w-5 h-5 shrink-0" aria-hidden="true" />;
  };

  const handleDismiss = () => {
    setIsVisible(false);
    props.onDismiss?.(props.alert.id);
  };

  // ARIA live region configuration based on alert type
  const ariaLive = () => props.alert.type === 'error' ? 'assertive' : 'polite';

  return (
    <Show when={isVisible()}>
      <div
        class={`
          alert ${ALERT_CLASSES[props.alert.type]}
          shadow-lg backdrop-blur-md
          pointer-events-auto
          animate-fade-in
          max-w-md mx-auto
        `}
        role={props.alert.type === 'error' ? 'alert' : 'status'}
        aria-live={ariaLive()}
        aria-atomic="true"
      >
        {/* Icon */}
        {getIcon()}
        
        {/* Message */}
        <span class="text-sm font-medium">{props.alert.message}</span>

        {/* Dismiss button */}
        <Show when={props.alert.dismissible !== false}>
          <button
            class="btn btn-ghost btn-sm btn-circle ml-auto"
            onClick={handleDismiss}
            aria-label="Dismiss alert"
          >
            <X class="w-4 h-4" />
          </button>
        </Show>
      </div>
    </Show>
  );
}

/**
 * Connection status indicator for the call header.
 */
export function ConnectionStatus(props: { 
  isConnected: boolean; 
  quality?: 'good' | 'fair' | 'poor';
}) {
  const qualityColor = () => {
    switch (props.quality) {
      case 'good': return 'bg-success';
      case 'fair': return 'bg-warning';
      case 'poor': return 'bg-error';
      default: return props.isConnected ? 'bg-success' : 'bg-error';
    }
  };

  return (
    <div 
      class="flex items-center gap-2 text-sm"
      role="status"
      aria-live="polite"
    >
      <div 
        class={`w-2 h-2 rounded-full ${qualityColor()} ${props.isConnected ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      />
      <span class="text-white/70">
        {props.isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}

/**
 * Encryption indicator badge.
 */
export function EncryptionBadge() {
  return (
    <div 
      class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/20 backdrop-blur-md text-xs text-white/70"
      role="img"
      aria-label="Call is end-to-end encrypted"
      title="End-to-end encrypted"
    >
      <Shield class="w-3 h-3" aria-hidden="true" />
      <span>Encrypted</span>
    </div>
  );
}

/**
 * Call duration timer display.
 */
export function CallTimer(props: { seconds: number }) {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10"
      role="timer"
      aria-label={`Call duration: ${formatTime(props.seconds)}`}
    >
      <div 
        class="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"
        aria-hidden="true"
      />
      <span class="text-white font-mono text-sm font-medium">
        {formatTime(props.seconds)}
      </span>
    </div>
  );
}

/**
 * Participant role badge.
 */
export function RoleBadge(props: { role: 'doctor' | 'patient' | 'host' | 'guest' }) {
  const roleLabel = () => {
    switch (props.role) {
      case 'doctor':
      case 'host':
        return 'Doctor';
      case 'patient':
      case 'guest':
        return 'Patient';
      default:
        return props.role;
    }
  };

  return (
    <span 
      class="badge badge-lg bg-white/10 text-white border-none backdrop-blur-md"
      role="status"
    >
      {roleLabel()}
    </span>
  );
}
