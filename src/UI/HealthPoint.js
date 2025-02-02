import { GameObjects } from 'phaser';

export class HealthPoint extends GameObjects.Sprite {
  flicker() {
    this.play('flicker');
  }

  illuminate() {
    this.stop();
    this.setFrame(0);
  }

  dim() {
    this.stop();
    this.setFrame(1);
  }

  isLit() {
    return this.anims.isPlaying || this.frame.name === this.texture.firstFrame;
  }
}
