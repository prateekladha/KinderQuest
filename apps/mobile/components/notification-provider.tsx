import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Platform } from "react-native";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";

interface NotificationDebugState {
  permissionStatus: string;
  projectId: string | null;
  expoPushToken: string | null;
  tokenSaveStatus: "idle" | "saving" | "success" | "error";
  tokenSaveError: string | null;
  lastEvent: string | null;
}

type NotificationRouteData = Record<string, unknown> | null | undefined;

const NotificationDebugContext = createContext<NotificationDebugState>({
  permissionStatus: "unknown",
  projectId: null,
  expoPushToken: null,
  tokenSaveStatus: "idle",
  tokenSaveError: null,
  lastEvent: null
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export function NotificationProvider({ children }: PropsWithChildren) {
  const { showToast } = useToast();
  const { client, session } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState("unknown");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [tokenSaveStatus, setTokenSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [tokenSaveError, setTokenSaveError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [pendingRouteData, setPendingRouteData] = useState<NotificationRouteData>(null);

  useEffect(() => {
    let active = true;

    async function bootstrapNotifications() {
      try {
        if (!client || !session?.user.id) {
          if (active) {
            console.info("[notifications] skipped=no-client-or-session");
            setLastEvent("skipped=no-client-or-session");
          }
          return;
        }

        const permission = await Notifications.getPermissionsAsync();
        let finalStatus = permission.status;

        if (finalStatus !== "granted") {
          const requested = await Notifications.requestPermissionsAsync();
          finalStatus = requested.status;
        }

        if (active) {
          console.info(`[notifications] permission-status=${finalStatus}`);
          setPermissionStatus(finalStatus);
          setLastEvent(`permission-status=${finalStatus}`);
        }

        if (finalStatus !== "granted") {
          return;
        }

        if (!Device.isDevice) {
          if (active) {
            console.info("[notifications] skipped=not-physical-device");
            setLastEvent("skipped=not-physical-device");
          }
          return;
        }

        const nextProjectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
        if (active) {
          setProjectId(nextProjectId ?? null);
        }

        if (!nextProjectId) {
          if (active) {
            console.info("[notifications] skipped=missing-project-id");
            setLastEvent("skipped=missing-project-id");
          }
          return;
        }

        if (active) {
          console.info(`[notifications] project-id=${nextProjectId}`);
          setLastEvent(`project-id=${nextProjectId}`);
        }

        const token = await Notifications.getExpoPushTokenAsync({ projectId: nextProjectId });
        if (active) {
          console.info(`[notifications] expo-push-token=${token.data}`);
          setExpoPushToken(token.data);
          setTokenSaveStatus("saving");
          setTokenSaveError(null);
          setLastEvent(`expo-push-token=${token.data}`);
        }

        const { error } = await client.from("push_tokens").upsert(
          {
            user_id: session.user.id,
            expo_push_token: token.data,
            platform: Platform.OS,
            device_name: Device.deviceName ?? null,
            disabled_at: null
          },
          {
            onConflict: "expo_push_token"
          }
        );

        if (error) {
          if (active) {
            console.info(`[notifications] token-save-error=${JSON.stringify(error)}`);
            setTokenSaveStatus("error");
            setTokenSaveError(error.message ?? JSON.stringify(error));
            setLastEvent("token-save-error");
          }
          return;
        }

        if (active) {
          console.info(`[notifications] token-save-success user=${session.user.id}`);
          setTokenSaveStatus("success");
          setTokenSaveError(null);
          setLastEvent(`token-save-success user=${session.user.id}`);
        }
      } catch (error) {
        if (active) {
          const message = error instanceof Error ? error.message : JSON.stringify(error);
          console.info(`[notifications] bootstrap-error=${message}`);
          setTokenSaveStatus("error");
          setTokenSaveError(message);
          setLastEvent(`bootstrap-error=${message}`);
        }
      }
    }

    void bootstrapNotifications();

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const title = notification.request.content.title?.trim();
      const body = notification.request.content.body?.trim();
      const message = [title, body].filter(Boolean).join(": ");

      if (message.length > 0) {
        showToast(message);
      }
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      setPendingRouteData(response.notification.request.content.data);
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) {
        return;
      }

      setPendingRouteData(response.notification.request.content.data);
    });

    return () => {
      active = false;
      subscription.remove();
      responseSubscription.remove();
    };
  }, [client, session?.user.id, showToast]);

  useEffect(() => {
    if (!session?.user.id || !pendingRouteData) {
      return;
    }

    routeFromNotificationData(pendingRouteData);
    setPendingRouteData(null);
  }, [session?.user.id, pendingRouteData]);

  useEffect(() => {
    if (__DEV__ && session?.access_token) {
      console.info(`[auth] jwt=${session.access_token}`);
    }
  }, [session?.access_token]);

  const value = useMemo(
    () => ({
      permissionStatus,
      projectId,
      expoPushToken,
      tokenSaveStatus,
      tokenSaveError,
      lastEvent
    }),
    [permissionStatus, projectId, expoPushToken, tokenSaveStatus, tokenSaveError, lastEvent]
  );

  return <NotificationDebugContext.Provider value={value}>{children}</NotificationDebugContext.Provider>;
}

function routeFromNotificationData(data: Record<string, unknown> | null | undefined) {
  const type = typeof data?.type === "string" ? data.type : "";

  if (type === "task_approved" || type === "task_rejected") {
    router.push("/tasks");
    return;
  }

  if (type === "reward_approved" || type === "reward_rejected") {
    router.push("/rewards");
    return;
  }

  if (type === "task_claimed" || type === "reward_requested") {
    router.push("/approvals");
    return;
  }

  if (type === "reward_fulfilled") {
    router.push("/dashboard");
  }
}

export function useNotificationDebug() {
  return useContext(NotificationDebugContext);
}
