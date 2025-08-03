import { create } from "zustand";
import { persist } from "zustand/middleware";

import customSessionStorage from "./customSessiontStorage";

const useTrendingStore = create(
  persist(
    (set) => ({
      thisWeekTrending: null,
      trendingRecipeDetails: [],
      setThisWeekTrending: (t) => set({ thisWeekTrending: t }),
      setTrendingRecipeDetails: (r) => set({ trendingRecipeDetails: r }),

      clearStore: () => ({
        thisWeekTrending: null,
        trendingRecipeDetails: []
      })
    }),
    {
      name: "trending-storage",
      storage: customSessionStorage
    }
  )
);

export default useTrendingStore;
