import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, token } = response.data.data;

          set({
            user,
            token,
            isAuthenticated: true,
          });

          // Set token in api service
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          return { success: true };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message_ar || 'فشل تسجيل الدخول',
          };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        delete api.defaults.headers.common['Authorization'];
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      // Initialize token in api service on app start
      initializeAuth: () => {
        const { token } = get();
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Initialize auth on store creation
useAuthStore.getState().initializeAuth();

export { useAuthStore };
