import { Scene } from 'phaser';
import {
  COLORS,
  WEBSITE_URL,
  MENU_ITEM_CONFIG,
  HOVER_TWEEN_CONFIG,
} from '../constants/menu.js';

export class PauseMenu extends Scene {
  constructor() {
    super('PauseMenu');
  }

  create() {
    const title = this.add
      .text(320, 60, 'Pause', {
        fontFamily: 'usuzi',
        fontSize: 40,
      })
      .setOrigin(0.5, 0);

    this.tweens.add({
      targets: title,
      ...HOVER_TWEEN_CONFIG,
    });

    const playButton = this.add
      .text(320, title.y + title.height + 32, 'Play', {
        fontFamily: 'usuzi',
        fontSize: 24,
        color: COLORS.foreground,
      })
      .setOrigin(0.5, 0)
      .setInteractive(MENU_ITEM_CONFIG);

    playButton.on('pointerover', onButtonHover);
    playButton.on('pointerout', onButtonOut);
    playButton.on('pointerup', (_pointer, _localX, _localY, event) => {
      this.scene.start('Game');
    });

    // TODO: Set text based on sound playback prefernce value
    // in local storage
    const soundToggleButton = this.add
      .text(320, playButton.y + 32, 'Sound: On', {
        fontFamily: 'usuzi',
        fontSize: 24,
        color: COLORS.foreground,
      })
      .setOrigin(0.5, 0)
      .setInteractive(MENU_ITEM_CONFIG);

    soundToggleButton.on('pointerover', onButtonHover);
    soundToggleButton.on('pointerout', onButtonOut);
    soundToggleButton.on('pointerup', () => {
      // TODO:
      // - Set sound playback preference in local storage
      // - Update soundToggle button text to either "Sound: On" or "Sound: Off"
      //   based on the current sound playback preference value
    });

    const creditsButton = this.add
      .text(320, soundToggleButton.y + 32, 'Credits', {
        fontFamily: 'usuzi',
        fontSize: 24,
        color: COLORS.foreground,
      })
      .setOrigin(0.5, 0)
      .setInteractive(MENU_ITEM_CONFIG);

    creditsButton.on('pointerover', onButtonHover);
    creditsButton.on('pointerout', onButtonOut);
    creditsButton.on('pointerup', () => {
      this.scene.start('Credits');
    });

    const footerText = this.add
      .text(320, 340, 'Colin Kiama - 2024', {
        fontFamily: 'usuzi',
        fontSize: 16,
        color: COLORS.foreground,
      })
      .setOrigin(0.5, 1)
      .setInteractive(MENU_ITEM_CONFIG);

    footerText.on('pointerover', onButtonHover);
    footerText.on('pointerout', onButtonOut);
    footerText.on('pointerup', () => {
      window.open(WEBSITE_URL, '_blank');
    });
  }
}

function onButtonHover() {
  this.setColor(COLORS.hoverForeground);
}

function onButtonOut() {
  this.setColor(COLORS.foreground);
}
