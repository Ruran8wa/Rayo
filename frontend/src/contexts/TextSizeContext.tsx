import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { userService } from "@services/api/user.service";
import { storage } from "@utils/storage";

const STORAGE_KEY = "pref_large_text";

interface TextSizeContextType {
  largeText: boolean;
  setLargeText: (value: boolean) => Promise<void>;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

export const TextSizeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [largeText, setLargeTextState] = useState(false);

  useEffect(() => {
    storage.get<boolean>(STORAGE_KEY).then((stored) => {
      if (stored !== null) setLargeTextState(stored);
    });
  }, []);

  const setLargeText = async (value: boolean) => {
    setLargeTextState(value);
    await storage.set(STORAGE_KEY, value);

    userService
      .setPreferences(undefined, { large_text: value })
      .catch(() => {});
  };

  return (
    <TextSizeContext.Provider value={{ largeText, setLargeText }}>
      {children}
    </TextSizeContext.Provider>
  );
};

export const useTextSize = () => {
  const ctx = useContext(TextSizeContext);
  if (!ctx) throw new Error("useTextSize must be used within TextSizeProvider");
  return ctx;
};
