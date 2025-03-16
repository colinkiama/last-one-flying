export const COLORS = {
  foreground: '#ffffff',
  hoverForeground: '#aaaaaa',
};

export const WEBSITE_URL = 'https://colinkiama.com';

export const MENU_ITEM_CONFIG = {
  cursor: 'pointer',
};

export const HOVER_TWEEN_CONFIG = {
  y: '-=10',
  duration: 1000,
  yoyo: true,
  repeat: -1,
};

export const CREDITS_LIST_ITEMS = [
  {
    title: 'Programming, Art and Audio',
    people: [{ name: 'Colin Kiama', href: 'https://colinkiama.com' }],
  },
  {
    title: 'Special Thanks',
    people: [
      {
        name: 'Ajmal Rizni',
      },
      {
        name: 'Ugur Saglik',
      },
      {
        name: 'That one tall bloke',
      },
    ],
  },
];

export const CONTROLS_LIST_ITEMS = [
  {
    title: 'Keyboard',
    controls: [
      {
        input: 'W',
        action: 'Move forward',
      },
      {
        input: 'A',
        action: 'Rotate left',
      },
      {
        input: 'S',
        action: 'Move backwards',
      },
      {
        input: 'D',
        action: 'Rotate right',
      },
      {
        input: 'J',
        action: 'Fire laser beam',
      },
      {
        input: 'P',
        action: 'Pause',
      },
    ],
  },
  {
    title: 'Touch',
    controls: [
      {
        input: 'Left Joystick Up',
        action: 'Move forward',
      },
      {
        input: 'Left Joystick Down',
        action: 'Move backwards',
      },
      {
        input: 'Right Joystick',
        action: 'Rotate ship and fire laser beam',
      },
    ],
  },
];
