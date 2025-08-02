import { create } from 'zustand';

const useMessageBoxStore = create((set) => ({
    messageBoxOpen: false,
    setMessageBoxOpen: (open) => set({ messageBoxOpen: open }),
    toggleMessageBox: () => set((state) => ({ messageBoxOpen: !state.messageBoxOpen })),
}));

export default useMessageBoxStore;