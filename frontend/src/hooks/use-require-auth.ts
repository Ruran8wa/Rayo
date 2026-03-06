import { useRouter } from "expo-router";
import { useAuth } from "@/contexts";

/**
 * Returns a wrapper that runs `action` only if the user is signed in.
 * If not signed in, redirects to the sign-in screen instead.
 */
export function useRequireAuth() {
  const { user } = useAuth();
  const router = useRouter();

  return (action: () => void) => {
    if (user) {
      action();
    } else {
      router.push("/(auth)/sign-in");
    }
  };
}
