import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { tokens } from "@kinderquest/ui";
import { useAuth } from "../../components/auth-provider";
import { LoadingState } from "../../components/loading-state";
import { useMembershipState } from "../../lib/membership";

const tabItems = {
  dashboard: "grid",
  home: "home",
  approvals: "checkmark-done",
  history: "time",
  tasks: "checkbox",
  rewards: "sparkles",
  store: "gift",
  parents: "people"
} as const;

export default function TabLayout() {
  const { session, isLoading } = useAuth();
  const membership = useMembershipState(session);

  if (!isLoading && !session) {
    return <Redirect href="/sign-in" />;
  }

  if (!isLoading && session && !membership.isLoading && !membership.hasMember) {
    return <Redirect href="/accept-invite" />;
  }

  if (session && membership.isLoading) {
    return <LoadingState />;
  }

  const isParent = membership.role === "parent";

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: tokens.color.secondary,
        tabBarInactiveTintColor: "#6a8694",
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: "#ffffff",
          borderTopWidth: 0
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700"
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = tabItems[route.name as keyof typeof tabItems] ?? "ellipse";

          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tabs.Screen name="dashboard" options={isParent ? { title: "Dashboard" } : { href: null }} />
      <Tabs.Screen name="approvals" options={isParent ? { title: "Approvals" } : { href: null }} />
      <Tabs.Screen name="history" options={isParent ? { title: "History" } : { href: null }} />
      <Tabs.Screen name="home" options={isParent ? { href: null } : { title: "Home" }} />
      <Tabs.Screen name="tasks" options={isParent ? { href: null } : { title: "Tasks" }} />
      <Tabs.Screen name="rewards" options={isParent ? { href: null } : { title: "My Rewards" }} />
      <Tabs.Screen name="store" options={isParent ? { href: null } : { title: "Store" }} />
      <Tabs.Screen name="parents" options={isParent ? { title: "Manage" } : { href: null }} />
    </Tabs>
  );
}
