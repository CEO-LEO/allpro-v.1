import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'th' | 'en';
export type Theme = 'light' | 'dark';

interface SettingsState {
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  
  // Notifications
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  
  // Sound
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Language state
      language: 'th',
      setLanguage: (lang) => {
        set({ language: lang });
        // Update HTML lang attribute
        if (typeof document !== 'undefined') {
          document.documentElement.lang = lang;
        }
      },

      // Theme state
      theme: 'light',
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      // Notifications
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

      // Sound
      soundEnabled: true,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
    }),
    {
      name: 'golden-hunter-settings',
      partialize: (state: SettingsState) => ({
        language: state.language,
        theme: state.theme,
        notificationsEnabled: state.notificationsEnabled,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);

// Initialize theme on app load
if (typeof window !== 'undefined') {
  // Check for saved theme or system preference
  const savedTheme = localStorage.getItem('golden-hunter-settings');
  if (savedTheme) {
    try {
      const settings = JSON.parse(savedTheme);
      const theme = settings.state?.theme || 'light';
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
}
