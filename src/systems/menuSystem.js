import { Scene } from 'phaser';
import {
  COLORS,
  HOVER_TWEEN_CONFIG,
  MENU_ITEM_CONFIG,
} from '../constants/menu.js';
/**
 * @typedef {Object} MenuItem
 * @property {boolean} [isInteractive] Determines if an item is selectable or not
 * @property {string} label
 * @property {function(): void} [action] Logic to run when item is selected
 */

/**
 * @typedef {Object} MenuTitle
 * @property {"text"|"image"} type
 * @property {string} value When `type` = "text"
 * it's the value of the text. When `type` = "image", it's the key of the image.
 */

/**
 * @typedef {Object} Menu
 * @property {string} [parent] `key` of the previous menu that led to this one
 * @property {string} key Unique identifier
 * @property {MenuTitle} title The content that appears on the top of the menu
 * @property {string} [summary]
 * @property {Array<MenuItem>} items
 * @property {(Array<MenuItem>)} [footerItems]
 */

export class MenuSystem {
  scene;
  /** @type {Map<string, Menu>} */
  menuMap;
  firstMenuKey;
  _currentMenuContainer;
  _titleTween;

  /**
   * @param {Scene} scene
   * @param {Array<Menu>} menus
   * @param {string} firstMenuKey
   */
  constructor(scene, menus, firstMenuKey) {
    this.scene = scene;
    this.firstMenuKey = firstMenuKey;
    this.menuMap = new Map();
    this._titleTween;

    for (const menu of menus) {
      this.menuMap.set(menu.key, menu);
    }

    if (this.menuMap.size > 1) {
      return;
    }

    this._currentMenuContainer = this.scene.add.container(0, 0);
    this._currentMenuContainer.add(
      this._renderMenu(this.menuMap.get(firstMenuKey)),
    );
  }

  /**
   * @param {string} key - Key of menu to switch to
   */
  push(key) {}

  pop() {}

  /**
   *
   * @param {Menu} menu
   * @param {*} options
   * @returns
   */
  _renderMenu(menu, options) {
    // TODO: Create menu to show on screen
    const title = createTitle(this.scene, menu.title);
    this._titleTween = this.scene.tweens.add({
      targets: title,
      ...HOVER_TWEEN_CONFIG,
    });

    let lastRenderedItem = title;

    const menuItems = menu.items.map((menuItem, index) => {
      const renderedItem = renderMenuItem(
        this.scene,
        menuItem,
        lastRenderedItem,
        index,
      );

      lastRenderedItem = renderedItem;
      return renderedItem;
    });

    // const footerItems = renderFooterItems(this.scene, menu.footerItems);
    // return [title, ...menuItems, ...footerItems];
    return [title];
  }
}

/**
 *
 * @param {Scene} scene
 * @param {MenuItem} menuItem
 * @param {*} lastRenderedItem
 */
function renderMenuItem(scene, menuItem, lastRenderedItem, index) {
  const y = lastRenderedItem.y + (index === 0 ? 80 : 32);

  const renderedMenuItem = scene.add
    .text(scene.cameras.main.width / 2, y, menuItem.label, {
      fontFamily: 'usuzi',
      fontSize: 24,
      color: COLORS.foreground,
    })
    .setOrigin(0.5, 0);

  if (menuItem.isInteractive === undefined || menuItem.isInteractive) {
    renderedMenuItem.setInteractive(MENU_ITEM_CONFIG);
    renderedMenuItem.on('pointerover', onButtonHover);
    renderedMenuItem.on('pointerout', onButtonOut);
    if (menuItem.action) {
      renderedMenuItem.on('pointerup', menuItem.action, scene);
    }
  }

  return renderedMenuItem;
}

/**
 *
 * @param {Scene} scene
 * @param {MenuTitle} titleData
 */
function createTitle(scene, titleData) {
  switch (titleData.type) {
    case 'text': {
      return scene.add
        .text(320, 60, 'Pause', {
          fontFamily: 'usuzi',
          fontSize: 40,
        })
        .setOrigin(0.5, 0);
    }
    default:
      throw new Error(`Unknown menu title type: ${titleData.type}`);
  }
}

function onButtonHover() {
  this.setColor(COLORS.hoverForeground);
}

function onButtonOut() {
  this.setColor(COLORS.foreground);
}
