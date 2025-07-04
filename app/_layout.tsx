import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView} from "react-native-gesture-handler"

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  //const [isNavigationReady, setIsNavigationReady] = useState(false);
  const { user, isLoadingUser } = useAuth();
  const segments = useSegments();

  // useEffect(() => {

  //   const timer = setTimeout(() => {
  //     setIsNavigationReady(true);
  //   }, 100)

  //   return () => clearTimeout(timer);
  // }, []);

  useEffect(() => {
    const isAuthRoute = segments[0] === "auth";
    if (!user && !isAuthRoute && !isLoadingUser) {
      router.replace("/auth");
    } else if (user && isAuthRoute && !isLoadingUser) {
      router.replace("/");
    }
  }, [user, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
    <AuthProvider>
      <PaperProvider>
      <SafeAreaProvider>
      <RouteGuard>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </RouteGuard>
      </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>
    </GestureHandlerRootView>
  );
}
