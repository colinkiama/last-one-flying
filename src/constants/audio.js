export const AudioKey = {
  MAIN_THEME: 'main-theme',
  BATTLE_THEME: 'battle-theme',
};

export const AudioMarkerKey = {
  BATTLE_THEME_LOOP: 'battle-theme-loop',
};

export const LOOP_MARKER_CONFIGS = {
  [AudioKey.BATTLE_THEME]: {
    name: AudioMarkerKey.BATTLE_THEME_LOOP,
    start: 6.3, // In Seconds
    duration: 101.7,
    config: {
      loop: true,
      seek: 6.3,
    }
  }
};
