import { Scene } from 'phaser';
import {
  COLORS,
  WEBSITE_URL,
  MENU_ITEM_CONFIG,
  HOVER_TWEEN_CONFIG,
} from '../constants/menu.js';
import { SceneKey } from '../constants/scene.js';
import { onButtonHover, onButtonOut } from '../utils/ui.js';
import { RegistryKey } from '../constants/data.js';
import { DependencyKey } from '../constants/injector.js';

export class MainMenu extends Scene {
  injector;
  _audioSystem;

  _music;

  constructor() {
    super(SceneKey.MAIN_MENU);
  }

  setupDependencies() {
    this.audioSystem = this.injector.get(DependencyKey.AUDIO_SYSTEM);
  }

  create() {
    if (!this._music) {
      this._music = this.sound.add('main-theme');
    }

    if (
      this.game.registry.get(RegistryKey.PLAY_SOUND) &&
      !this._music.isPlaying
    ) {
      this._music.play({ loop: true });
    }

    const logo = this.add.image(320, 60, 'logo').setOrigin(0.5, 0);
    this.tweens.add({
      targets: logo,
      ...HOVER_TWEEN_CONFIG,
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
    playButton.on('pointerup', this.startNewGame, this);

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
    soundToggleButton.on('pointerup', this.onSoundToggle, this);
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
    creditsButton.on('pointerup', this.showCredits, this);

    const footerText = this.add
      .text(320, 340, 'Colin Kiama - 2025', {
        fontFamily: 'usuzi',
        fontSize: 16,
        color: COLORS.foreground,
      })
      .setOrigin(0.5, 1)
      .setInteractive(MENU_ITEM_CONFIG);

    footerText.on('pointerover', onButtonHover);
    footerText.on('pointerout', onButtonOut);
    footerText.on('pointerup', onFooterCreditsClick);

    this.events.once('shutdown', () => {
      // Unsubscribe from events
    });
  }
  showCredits() {
    this.scene.start(SceneKey.CREDITS);
  }

  startNewGame() {
    this.scene.start(SceneKey.BATTLE);
  }

  onSoundToggle() {
    // TODO:
    // - Set sound playback preference in local storage
    // - Update soundToggle button text to either "Sound: On" or "Sound: Off"
    //   based on the current sound playback preference value
  }
}

function onFooterCreditsClick() {
  window.open(WEBSITE_URL, '_blank');
}
