import { Input } from 'phaser';

export function createMovementKeys(keyboardPlugin) {
  return keyboardPlugin.addKeys({
    up: Input.Keyboard.KeyCodes.W,
    down: Input.Keyboard.KeyCodes.S,
    left: Input.Keyboard.KeyCodes.A,
    right: Input.Keyboard.KeyCodes.D,
    upAlt: Input.Keyboard.KeyCodes.UP,
    downAlt: Input.Keyboard.KeyCodes.DOWN,
    leftAlt: Input.Keyboard.KeyCodes.LEFT,
    rightAlt: Input.Keyboard.KeyCodes.RIGHT,
  });
}

export function createCombatKeys(keyboardPlugin) {
  return keyboardPlugin.addKeys({
    shoot: Input.Keyboard.KeyCodes.J,
    shootAlt: Input.Keyboard.KeyCodes.SPACE,
  });
}
