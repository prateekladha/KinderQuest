import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { tokens } from "@kinderquest/ui";

type ToastTone = "success" | "error";

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {}
});

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const value = useMemo<ToastContextValue>(() => ({
    showToast(message, tone = "success") {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast({ message, tone });
      timeoutRef.current = setTimeout(() => {
        setToast(null);
      }, 2600);
    }
  }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View pointerEvents="none" style={styles.container}>
          <View style={[styles.toast, toast.tone === "success" ? styles.toastSuccess : styles.toastError]}>
            <Text style={styles.message}>{toast.message}</Text>
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 28,
    alignItems: "center"
  },
  toast: {
    minHeight: 48,
    maxWidth: 420,
    borderRadius: tokens.radius.large,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...tokens.shadow.soft
  },
  toastSuccess: {
    backgroundColor: "#d8f7d3"
  },
  toastError: {
    backgroundColor: "#ffd8d3"
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: tokens.color.text
  }
});
