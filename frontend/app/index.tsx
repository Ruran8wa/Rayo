import { useAuth } from "@contexts/AuthContext";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { storage } from "@utils/storage";

export default function Index() {
  const { loading } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    storage.get<boolean>("hasSeenOnboarding").then((val) => {
      setHasOnboarded(!!val);
    });
  }, []);

  if (loading || hasOnboarded === null) return null;
  if (!hasOnboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
