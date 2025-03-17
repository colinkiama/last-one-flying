import { Scene } from 'phaser';
import {
  COLORS,
  MENU_ITEM_CONFIG,
  HOVER_TWEEN_CONFIG,
  CREDITS_LIST_ITEMS,
} from '../constants/menu.js';

import { SceneKey } from '../constants/scene.js';
import { DependencyKey } from '../constants/injector.js';
import { SoundFXKey } from '../constants/audio.js';

export class Credits extends Scene {
  injector;
  _audioSystem;
  _interactiveItems;
  _backButton;

  constructor() {
    super(SceneKey.CREDITS);
    this._interactiveItems = [];
  }

  setupDependencies() {
    this._audioSystem = this.injector.get(DependencyKey.AUDIO_SYSTEM);
  }

  create() {
    this._interactiveItems = [];

    const title = this.add
      .text(320, 60, 'Credits', {
        fontFamily: 'usuzi',
        fontSize: 40,
      })
      .setOrigin(0.5, 0);

    this.tweens.add({
      targets: title,
      ...HOVER_TWEEN_CONFIG,
    });

    let lastSectionItem = title;

    for (let i = 0; i < CREDITS_LIST_ITEMS.length; i++) {
      const section = CREDITS_LIST_ITEMS[i];
      lastSectionItem = this.add
        .text(
          320,
          lastSectionItem.y + lastSectionItem.height + (i === 0 ? 20 : 16),
          section.title,
          {
            fontFamily: 'usuzi',
            fontSize: 24,
          },
        )
        .setOrigin(0.5, 0);

      let previousListItem = lastSectionItem;
      const people = section.people;
      for (let j = 0; j < people.length; j++) {
        const listItem = people[j];
        previousListItem = this.add
          .text(
            320,
            previousListItem.y + previousListItem.height + (j === 0 ? 8 : 4),
            listItem.name,
            {
              fontFamily: 'usuzi',
              fontSize: 20,
            },
          )
          .setOrigin(0.5, 0);

        const href = listItem.href;
        if (href) {
          previousListItem.setInteractive(MENU_ITEM_CONFIG);
          previousListItem.on('pointerover', onButtonHover);
          previousListItem.on('pointerover', onButtonHoverForInstance, this);
          previousListItem.on('pointerout', onButtonOut);
          previousListItem.on('pointerup', onButtonPress);
          previousListItem.on('pointerup', onButtonPressForInstance, this);
          previousListItem.setData('href', href);
          this._interactiveItems.push(previousListItem);
        }

        if (j === people.length - 1) {
          lastSectionItem = previousListItem;
        }
      }
    }

    this._backButton = this.add
      .text(320, 340, 'Back to Main Menu', {
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
        for (let i = this._interactiveItems.length - 1; i > -1; i--) {
          const item = this._interactiveItems[i];
          item.off('pointerover', onButtonHover);
          item.off('pointerover', onButtonHoverForInstance, this);
          item.off('pointerout', onButtonOut);
          item.off('pointerup', onButtonPress);
          item.off('pointerup', onButtonPressForInstance, this);
        }

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
  this.scene.start(SceneKey.MAIN_MENU);
}

function onButtonPress() {
  window.open(this.getData('href'), '_blank');
}

function onButtonPressForInstance() {
  this._audioSystem.playSFX(SoundFXKey.ITEM_SELECTION);
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
