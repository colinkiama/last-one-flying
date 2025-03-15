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

export class Controls extends Scene {
    injector;
    _audioSystem;

    constructor() {
        super(SceneKey.CONTROLS);
    }

    setupDependencies() {
        this._audioSystem = this.injector.get(DependencyKey.AUDIO_SYSTEM);
    }

    create() {
        const title = this.add
        .text(320, 60, 'Controls', {
            fontFamily: 'usuzi',
            fontSize: 40,
        })
        .setOrigin(0.5, 0);

        this.tweens.add({
            targets: title,
            ...HOVER_TWEEN_CONFIG,
        });

        // Insert controls text here...

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
