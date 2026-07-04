"use client";

import { useEffect, useRef } from "react";
import { useNotifications } from "./use-notifications-achievements";
import { showBrowserNotification, playNotificationChime } from "@/lib/notifications/browser-push";

const SEEN_KEY = "dsa-master-seen-notifications";
const SEEN_TTL_MS = 12 * 60 * 60 * 1000; // re-alert after 12 hours even for the same reminder id

interface SeenEntry {
  [id: string]: number;
}

function loadSeen(): SeenEntry {
  try {
    return JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveSeen(seen: SeenEntry) {
  window.localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
}

export function useBrowserNotificationWatcher() {
  const { data: notifications } = useNotifications();
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!notifications) return;

    // Skip firing on the very first load of a session — only alert for
    // reminders that appear during the session, so opening the app doesn't
    // immediately spam every reminder that was already true.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      const seen = loadSeen();
      const now = Date.now();
      notifications.forEach((n) => {
        seen[n.id] = now;
      });
      saveSeen(seen);
      return;
    }

    const seen = loadSeen();
    const now = Date.now();
    let changed = false;

    notifications.forEach((n) => {
      const lastAlerted = seen[n.id];
      if (!lastAlerted || now - lastAlerted > SEEN_TTL_MS) {
        showBrowserNotification("DSA Master", n.message);
        playNotificationChime();
        seen[n.id] = now;
        changed = true;
      }
    });

    if (changed) saveSeen(seen);
  }, [notifications]);
}
