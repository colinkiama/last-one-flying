import { Scene } from 'phaser';
import { COLORS, WEBSITE_URL, MENU_ITEM_CONFIG } from '../constants/menu.js';

export class MainMenu extends Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    const logo = this.add.image(320, 60, 'logo').setOrigin(0.5, 0);

    const playButton = this.add
      .text(320, logo.y + logo.height + 48, 'Play', {
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

    const creditsButton = this.add
      .text(320, playButton.y + 32, 'Credits', {
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
  document.curso;
}

function onButtonOut() {
  this.setColor(COLORS.foreground);
}
