import { create } from 'zustand';

interface AuthState {
  phone: string;
  countryCode: string;
  isAuthenticated: boolean;
  token: string | null;
  setPhone: (phone: string, countryCode: string) => void;
  setAuthenticated: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  phone: '',
  countryCode: '+51',
  isAuthenticated: false,
  token: null,
  setPhone: (phone, countryCode) => set({ phone, countryCode }),
  setAuthenticated: (token) => set({ token, isAuthenticated: true }),
  logout: () => set({ token: null, isAuthenticated: false, phone: '', countryCode: '+51' }),
}));
