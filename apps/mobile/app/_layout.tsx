import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../components/auth-provider";
import { LoadingState } from "../components/loading-state";
import { NotificationProvider } from "../components/notification-provider";
import { ToastProvider } from "../components/toast-provider";
import { useAuth } from "../components/auth-provider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <RootNavigator />
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="start-setup" />
        <Stack.Screen name="create-family" />
        <Stack.Screen name="accept-invite" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="debug-notifications" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
