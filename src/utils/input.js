import { Input } from 'phaser';

export function createMovementKeys(keyboardPlugin) {
  return keyboardPlugin.addKeys({
    up: Input.Keyboard.KeyCodes.W,
    down: Input.Keyboard.KeyCodes.S,
    left: Input.Keyboard.KeyCodes.A,
    right: Input.Keyboard.KeyCodes.D,
  });
}

export function createCombatKeys(keyboardPlugin) {
  return keyboardPlugin.addKeys({
    shoot: Input.Keyboard.KeyCodes.J,
  });
}
