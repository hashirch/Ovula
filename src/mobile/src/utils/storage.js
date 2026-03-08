import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  // Token management
  setToken: async (token) => {
    try {
      await AsyncStorage.setItem('token', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  removeToken: async () => {
    try {
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // User data management
  setUser: async (user) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  getUser: async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  removeUser: async () => {
    try {
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },

  // Clear all data
  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  // Generic storage
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  },

  getItem: async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  },

  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },
};
