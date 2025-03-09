export const AudioKey = {
  MAIN_THEME: 'main-theme',
  BATTLE_THEME: 'battle-theme',
};

export const SoundFXKey = {
  EXPLOSION: 'explosion',
};

export const AudioMarkerKey = {
  BATTLE_THEME_LOOP: 'battle-theme-loop',
};

const BATTLE_THEME_LENGTH = 109.761;
const BATTLE_LOOP_MARKER_START = 6.3;
const BATTLE_THEME_LOOP_DURATION =
  BATTLE_THEME_LENGTH - BATTLE_LOOP_MARKER_START;

export const LOOP_MARKER_CONFIGS = {
  [AudioKey.BATTLE_THEME]: {
    name: AudioMarkerKey.BATTLE_THEME_LOOP,
    start: BATTLE_LOOP_MARKER_START, // In Seconds
    duration: BATTLE_THEME_LOOP_DURATION,
    config: {
      loop: true,
      seek: BATTLE_LOOP_MARKER_START,
    },
  },
};
