import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
    persist(
        (set) => ({
            currentUser: null,
            setCurrentUser: (user) => set({ currentUser: user }),
            clearCurrentUser: () => set({ currentUser: null }),
        }),
        {
            name: "auth-storage",
            getStorage: () => sessionStorage,
        }
    )
);

export default useAuthStore;
