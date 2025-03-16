import { Scene } from 'phaser';
import {
  COLORS,
  WEBSITE_URL,
  MENU_ITEM_CONFIG,
  HOVER_TWEEN_CONFIG,
  CONTROLS_LIST_ITEMS,
} from '../constants/menu.js';

import { SceneKey } from '../constants/scene.js';
import { DependencyKey } from '../constants/injector.js';
import { SoundFXKey } from '../constants/audio.js';

export class Controls extends Scene {
  injector;
  _audioSystem;
  _backButton;

  constructor() {
    super(SceneKey.CONTROLS);
  }

  setupDependencies() {
    this._audioSystem = this.injector.get(DependencyKey.AUDIO_SYSTEM);
  }

  create(data) {
    this.data.merge(data);
    this.cameras.main.setBackgroundColor(0x00000000);

    const title = this.add
      .text(320, 20, 'Controls', {
        fontFamily: 'usuzi',
        fontSize: 40,
      })
      .setOrigin(0.5, 0);

    this.tweens.add({
      targets: title,
      ...HOVER_TWEEN_CONFIG,
    });

    // Insert controls text here...
    let lastSectionItem = title;

    for (let i = 0; i < CONTROLS_LIST_ITEMS.length; i++) {
      const section = CONTROLS_LIST_ITEMS[i];
      lastSectionItem = this.add
        .text(
          320,
          lastSectionItem.y + lastSectionItem.height + (i === 0 ? 20 : 16),
          section.title,
          {
            fontFamily: 'usuzi',
            fontSize: 18,
          },
        )
        .setOrigin(0.5, 0);

      let previousListItem = lastSectionItem;
      const controls = section.controls;
      for (let j = 0; j < controls.length; j++) {
        const listItem = controls[j];
        previousListItem = this.add
          .text(
            320,
            previousListItem.y + previousListItem.height + (j === 0 ? 8 : 4),
            `${listItem.input} - ${listItem.action}`,
            {
              fontFamily: 'usuzi',
              fontSize: 14,
            },
          )
          .setOrigin(0.5, 0);

        if (j === controls.length - 1) {
          lastSectionItem = previousListItem;
        }
      }
    }

    this._backButton = this.add
      .text(320, 340, 'Go back', {
        fontFamily: 'usuzi',
        fontSize: 16,
        color: COLORS.foreground,
      })
      .setOrigin(0.5, 1)
      .setInteractive(MENU_ITEM_CONFIG);

    this._backButton.on('pointerover', onButtonHover);
    this._backButton.on('pointerover', onButtonHoverForInstance, this);
    this._backButton.on('pointerout', onButtonOut);
    this._backButton.on('pointerup', onBackButtonPressForInstance, this);

    this.events.once(
      'shutdown',
      () => {
        this._backButton.off('pointerover', onButtonHover);
        this._backButton.off('pointerover', onButtonHoverForInstance, this);
        this._backButton.off('pointerout', onButtonOut);
        this._backButton.off('pointerup', onBackButtonPressForInstance, this);
      },
      this,
    );
  }
}

function onBackButtonPressForInstance() {
  this._audioSystem.playSFX(SoundFXKey.ITEM_SELECTION);
  this.scene.start(this.data.get('returnScene'), {
    isReturning: true,
  });
}

function onButtonHoverForInstance() {
  this._audioSystem.playSFX(SoundFXKey.ITEM_HOVER);
}

function onButtonHover() {
  this.setColor(COLORS.hoverForeground);
}

function onButtonOut() {
  this.setColor(COLORS.foreground);
}
