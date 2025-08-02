import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
    persist(
        (set) => ({
            currentUser: null,
            setCurrentUser: (user) => set({ currentUser: user }),
            clearCurrentUser: () => set({ currentUser: null }),
            _hasHydrated: false,
            setHasHydrated: () => set({ _hasHydrated: true }),
        }),
        {
            name: "auth-storage",
            getStorage: () => sessionStorage,
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated?.(); // gọi sau khi hydrate xong
            },
        }
    )
);

export default useAuthStore;
