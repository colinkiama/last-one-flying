import { Scene } from 'phaser';
/**
 * @typedef {Object} MenuItem
 * @property {boolean|undefined} isInteractive - Determines if an item is selectable or not
 * @property {string} label
 * @property {function(): void} action - Logic to run when item is selected
 */

/**
 * @typedef {Object} MenuTitle
 * @property {"text"|"image"} type
 * @property {string} value - When `type` = "text"
 * it's the value of the text. When `type` = "image", it's the key of the image.
 */

/**
 * @typedef {Object} Menu
 * @property {string} parent - `key` of the previous menu that led to this one
 * @property {string} key - Unique identifier
 * @property {MenuTitle} title - The content that appears on the top of the menu
 * @property {string} summary
 * @property {Array<MenuItem>} items
 * @property {(Array<MenuItem>|undefined)} footerItems
 */

export class MenuSystem {
  scene;
  menuMap;
  firstMenuKey;

  /**
   * @param {Scene} scene
   * @param {Array<Menu>} menus
   * @param {string} firstMenuKey
   */
  constructor(scene, menus, firstMenuKey) {
    this.scene = scene;
    this.firstMenuKey = firstMenuKey;
    this.menuMap = new Map();

    for (const menu of menus) {
      this.menuMap.set(menu.key, menu);
    }
  }

  /**
   * @param {string} key - Key of menu to switch to
   */
  push(key) {}

  pop() {}
}
