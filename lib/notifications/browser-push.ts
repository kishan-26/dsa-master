export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

/** Must be called from a user gesture (e.g. a button click) — browsers block silent permission requests. */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";
  return Notification.requestPermission();
}

export function showBrowserNotification(title: string, body: string) {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: "dsa-master-reminder", // replaces any previous reminder instead of stacking
    });
  } catch {
    // Notification constructor can throw on some mobile browsers that only
    // support notifications via a Service Worker — fail silently rather
    // than crash the app over a nice-to-have.
  }
}

/**
 * Plays a short two-tone chime using the Web Audio API. No audio file
 * needed (none was available to source in this sandbox), and it respects
 * autoplay rules since it only ever fires in response to a notification
 * triggered by user-visible in-app state.
 */
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq: number, startTime: number, duration: number) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(880, now, 0.12);
    playTone(1108.73, now + 0.1, 0.18);
  } catch {
    // Web Audio isn't available in every environment — skip the sound
    // rather than throw.
  }
}
