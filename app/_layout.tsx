import { AuthProvider } from "@/lib/auth-context";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const isAuth = false; // Replace with your authentication logic

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100)

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isNavigationReady && !isAuth) {
      router.replace("/auth");
    }
  }, [ isAuth, router, isNavigationReady ]);

  if (!isNavigationReady) {
    return null; // or a loading spinner
  }

  return <>{children}</>; 

}

export default function RootLayout() {
  return (
    <AuthProvider>
    <RouteGuard>
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
    </RouteGuard>
    </AuthProvider>
  );
}
