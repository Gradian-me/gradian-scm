import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '@/types';

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  getUserId: () => string | null;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        
        setUser: (user: User | null) => {
          set({ user }, false, 'setUser');
        },
        
        getUserId: () => {
          const user = get().user;
          return user?.id || null;
        },
        
        clearUser: () => {
          set({ user: null }, false, 'clearUser');
        },
      }),
      {
        name: 'user-store',
      }
    ),
    {
      name: 'user-store',
    }
  )
);

