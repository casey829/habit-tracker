// import { AuthProvider, useAuth } from "@/lib/auth-context";
// import { Stack, useRouter, useSegments } from "expo-router";
// import React, { useEffect } from "react";
// import { PaperProvider } from "react-native-paper";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import { GestureHandlerRootView} from "react-native-gesture-handler"

// function RouteGuard({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   //const [isNavigationReady, setIsNavigationReady] = useState(false);
//   const { user, isLoadingUser } = useAuth();
//   const segments = useSegments();

//   // useEffect(() => {

//   //   const timer = setTimeout(() => {
//   //     setIsNavigationReady(true);
//   //   }, 100)

//   //   return () => clearTimeout(timer);
//   // }, []);

//   useEffect(() => {
//     const isAuthRoute = segments[0] === "auth";
//     if (!user && !isAuthRoute && !isLoadingUser) {
//       router.replace("/auth");
//     } else if (user && isAuthRoute && !isLoadingUser) {
//       router.replace("/");
//     }
//   }, [user, segments]);

//   return <>{children}</>;
// }

// export default function RootLayout() {
//   return (
//     <GestureHandlerRootView>
//     <AuthProvider>
//       <PaperProvider>
//       <SafeAreaProvider>
//       <RouteGuard>
//         <Stack>
//           <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         </Stack>
//       </RouteGuard>
//       </SafeAreaProvider>
//       </PaperProvider>
//     </AuthProvider>
//     </GestureHandlerRootView>
//   );
// }

import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, useRouter, useSegments } from "expo-router";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { setUserProperty, trackEvent, trackScreenView } from "../lib/analytics"; // Make sure this is the correct path

// Handles navigation, auth state, and tracking logic
function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoadingUser } = useAuth();

  // Prevent flashing the wrong screen during auth loading
  if (isLoadingUser) return null;

  // Track screen changes
  useEffect(() => {
    if (segments.length > 0) {
      const screenName = segments.join("/");
      trackScreenView(screenName);
    }
  }, [segments]);

  // Track auth events + set user properties
  useEffect(() => {
    if (user) {
      trackEvent("user_logged_in", {
        user_id: user.uid || "unknown",
        timestamp: new Date().toISOString(),
      });
      setUserProperty("user_id", user.uid || "unknown");
      setUserProperty("user_status", "authenticated");
    } else {
      trackEvent("user_logged_out", {
        timestamp: new Date().toISOString(),
      });
      setUserProperty("user_status", "unauthenticated");
    }
  }, [user]);

  // Handle redirects
  useEffect(() => {
    const isAuthRoute = segments[0] === "auth";

    if (!user && !isAuthRoute) {
      trackEvent("redirect_to_auth", {
        from_route: segments.join("/"),
      });
      router.replace("/auth");
    } else if (user && isAuthRoute) {
      trackEvent("redirect_to_main_app", {
        user_id: user.uid || "unknown",
      });
      router.replace("/");
    }
  }, [user, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  // Track app open on first mount
  useEffect(() => {
    trackEvent("app_opened", {
      timestamp: new Date().toISOString(),
      platform: "mobile",
    });

    trackScreenView("app_root");
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
