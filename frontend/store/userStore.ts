
import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { UserProfile } from '@/types/auth';

type AuthState = {
  authUser: UserProfile | null;
  setAuthUserFromToken: () => void;
  logout: () => void;
};

export const useUserStore = create<AuthState>((set) => ({
  authUser: null,

  setAuthUserFromToken: () => {
    if (typeof document === 'undefined') return;

    const token = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('jwt='))
      ?.split('=')[1];

    if (!token) return;

    try {
      const decoded = jwtDecode<UserProfile>(token);

      console.log(decoded,'deded');

      // Optional: Check for required fields
      if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
        throw new Error('Invalid token payload');
      }

      set({ authUser: decoded });
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      set({ authUser: null });
    }
  },

  logout: () => {
    // Clear from Zustand
    set({ authUser: null });

    // Optionally clear cookie too
    if (typeof document !== 'undefined') {
      document.cookie =
        'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  },
}));
