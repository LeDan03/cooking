import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

const usePersonalStore = create(
  persist(
    (set, get) => ({
      /* ---------- STATE ---------- */
      lovedRecipes: [], // [{ id, ... }]
      savedRecipes: [],
      followers: [],
      followees: [],

      /* ---------- SETTERS ---------- */
      setLovedRecipes: (list) =>
        set((state) => {
          if (shallow(state.lovedRecipes, list)) return state; // Không cập nhật nếu dữ liệu giống nhau
          console.log('Updating lovedRecipes:', list);
          return { lovedRecipes: list };
        }),
      setSavedRecipes: (list) =>
        set((state) => {
          if (shallow(state.savedRecipes, list)) return state; // Không cập nhật nếu dữ liệu giống nhau
          console.log('Updating savedRecipes:', list);
          return { savedRecipes: list };
        }),
      setFollowers: (list) =>
        set((state) => {
          if (shallow(state.followers, list)) return state; // Không cập nhật nếu dữ liệu giống nhau
          console.log('Updating followers:', list);
          return { followers: list };
        }),
      setFollowees: (list) =>
        set((state) => {
          if (shallow(state.followees, list)) return state; // Không cập nhật nếu dữ liệu giống nhau
          console.log('Updating followees:', list);
          return { followees: list };
        }),

      /* ---------- PATCHERS ---------- */
      /**
       * Thêm hoặc xóa 1 recipe khỏi danh sách đã thích
       * @param {number} id ID công thức
       * @param {boolean} isRemoving true => xóa, false => thêm
       */
      patchLoved: (id, isRemoving) =>
        set((state) => {
          const newLovedRecipes = isRemoving
            ? state.lovedRecipes.filter((r) => r.id !== id)
            : [...state.lovedRecipes, { id }];
          if (shallow(state.lovedRecipes, newLovedRecipes)) return state; // Không cập nhật nếu dữ liệu giống nhau
          console.log('Patching lovedRecipes:', newLovedRecipes);
          return { lovedRecipes: newLovedRecipes };
        }),
      patchSaved: (id, isRemoving) =>
        set((state) => {
          const newSavedRecipes = isRemoving
            ? state.savedRecipes.filter((r) => r.id !== id)
            : [...state.savedRecipes, { id }];
          if (shallow(state.savedRecipes, newSavedRecipes)) return state; // Không cập nhật nếu dữ liệu giống nhau
          console.log('Patching savedRecipes:', newSavedRecipes);
          return { savedRecipes: newSavedRecipes };
        }),
    }),
    {
      name: 'personal-storage',
      storage: {
        getItem: (key) => sessionStorage.getItem(key),
        setItem: (key, value) => sessionStorage.setItem(key, value),
        removeItem: (key) => sessionStorage.removeItem(key),
      },
    }
  )
);

export default usePersonalStore;