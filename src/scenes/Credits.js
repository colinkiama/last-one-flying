import { Scene } from 'phaser';
import {
  COLORS,
  WEBSITE_URL,
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

  constructor() {
    super(SceneKey.CREDITS);
  }

  setupDependencies() {
    this._audioSystem = this.injector.get(DependencyKey.AUDIO_SYSTEM);
  }

  create() {
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
          previousListItem.on('pointerup', () => {
            this._audioSystem.playSFX(SoundFXKey.ITEM_SELECTION);
            window.open(href, '_blank');
          });
        }

        if (j === people.length - 1) {
          lastSectionItem = previousListItem;
        }
      }
    }

    const backButton = this.add
      .text(320, 340, 'Back to Main Menu', {
        fontFamily: 'usuzi',
        fontSize: 16,
        color: COLORS.foreground,
      })
      .setOrigin(0.5, 1)
      .setInteractive(MENU_ITEM_CONFIG);

    backButton.on('pointerover', onButtonHover);
    backButton.on('pointerover', onButtonHoverForInstance, this);
    backButton.on('pointerout', onButtonOut);
    backButton.on('pointerup', () => {
      this._audioSystem.playSFX(SoundFXKey.ITEM_SELECTION)
      this.scene.start(SceneKey.MAIN_MENU, { playMusic: false });
    });
  }
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
