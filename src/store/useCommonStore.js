// store/commonStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCommonStore = create(
  persist(
    (set) => ({
      /* --- dữ liệu --- */
      recipes: [],
      categories: [],
      difficulties: [],
      messages: [],

      /* --- setter chính --- */
      setRecipes: (list) => set({ recipes: list }),
      setCategories: (list) => set({ categories: list }),
      setDifficulties: (list) => set({ difficulties: list }),
      setMessages: (list) => set({ messages: list }),

      clearStore: () => set({
        recipes: [],
        categories: [],
        difficulties: [],
        messages: []
      }),
      /* --- patch 1 recipe (dùng cho love/unlove, comment…) --- */
      patchRecipe: (id, patch) =>
        set((state) => ({
          recipes: state.recipes.map((r) =>
            r.id === id ? { ...r, ...patch } : r
          ),
        })),
    })
    ,
    {
      name: 'common-storage',
      storage: {
        getItem: (key) => sessionStorage.getItem(key),
        setItem: (key, value) => sessionStorage.setItem(key, value),
        removeItem: (key) => sessionStorage.removeItem(key),
      },
    }
  )
);

export default useCommonStore