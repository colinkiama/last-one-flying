import { Scene } from 'phaser';
import { COLORS, WEBSITE_URL, MENU_ITEM_CONFIG } from '../constants/menu.js';

export class MainMenu extends Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    const logo = this.add.image(320, 60, 'logo').setOrigin(0.5, 0);
    const hoverTween = this.tweens.add({
      targets: logo,
      y: '-=10',
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    const playButton = this.add
      .text(320, logo.y + logo.height + 32, 'Play', {
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
