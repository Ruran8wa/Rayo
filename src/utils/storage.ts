/**
 * Storage Utility
 * Wrapper around AsyncStorage for type-safe storage operations
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  /**
   * Save data to storage
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error("Storage set error:", error);
      throw error;
    }
  },

  /**
   * Get data from storage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error("Storage get error:", error);
      return null;
    }
  },

  /**
   * Remove data from storage
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Storage remove error:", error);
      throw error;
    }
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Storage clear error:", error);
      throw error;
    }
  },

  /**
   * Get all keys
   */
  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error("Storage getAllKeys error:", error);
      return [];
    }
  },
};
