import { Scene } from 'phaser';

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
        color: '#ffffff',
      })
      .setOrigin(0.5, 0);

    const creditsButton = this.add
      .text(320, playButton.y + 32, 'Credits', {
        fontFamily: 'usuzi',
        fontSize: 24,
        color: '#ffffff',
      })
      .setOrigin(0.5, 0);

    const footerText = this.add
      .text(320, 340, 'Colin Kiama - 2024', {
        fontFamily: 'usuzi',
        fontSize: 16,
        color: '#ffffff',
      })
      .setOrigin(0.5, 1);

    this.input.once('pointerdown', () => {
      this.scene.start('Game');
    });
  }
}
