const customSessionStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(name, value);
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(name);
  },
};

export default customSessionStorage