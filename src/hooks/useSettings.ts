import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  textSize: 'normal' | 'large' | 'extra_large';
  setTextSize: (size: 'normal' | 'large' | 'extra_large') => void;

  simpleMode: boolean;
  setSimpleMode: (val: boolean) => void;

  highContrast: boolean;
  setHighContrast: (val: boolean) => void;

  readAloud: boolean;
  setReadAloud: (val: boolean) => void;

  audioSpeed: 'normal' | 'slow';
  setAudioSpeed: (speed: 'normal' | 'slow') => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      textSize: 'normal',
      setTextSize: (textSize) => {
        set({ textSize });
        document.documentElement.setAttribute('data-text-size', textSize);
      },

      simpleMode: false,
      setSimpleMode: (simpleMode) => set({ simpleMode }),

      highContrast: false,
      setHighContrast: (highContrast) => {
        set({ highContrast });
        document.documentElement.setAttribute('data-high-contrast', highContrast ? 'true' : 'false');
      },

      readAloud: false,
      setReadAloud: (readAloud) => set({ readAloud }),

      audioSpeed: 'normal',
      setAudioSpeed: (audioSpeed) => set({ audioSpeed }),
    }),
    {
      name: 'career-sarthi-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-text-size', state.textSize);
          document.documentElement.setAttribute('data-high-contrast', state.highContrast ? 'true' : 'false');
        }
      },
    }
  )
);
