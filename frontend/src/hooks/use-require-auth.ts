import { useRouter } from "expo-router";
import { useAuth } from "@/contexts";

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
