import { router } from "expo-router";

let tapCount = 0;
let lastTapAt = 0;

export function registerDebugTap() {
  const now = Date.now();

  if (now - lastTapAt > 3000) {
    tapCount = 0;
  }

  lastTapAt = now;
  tapCount += 1;

  if (tapCount >= 5) {
    tapCount = 0;
    router.push("/debug-notifications");
  }
}
