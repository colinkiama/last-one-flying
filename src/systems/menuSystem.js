import { GameObjects, Scene, Tweens, Display } from 'phaser';
import {
  COLORS,
  HOVER_TWEEN_CONFIG,
  MENU_ITEM_CONFIG,
} from '../constants/menu.js';

/**
 * @typedef {Object} MenuItem
 * @property {boolean} [isInteractive] Determines if an item is selectable or not
 * @property {string} label
 * @property {function(...any):void} [action] Logic to run when item is selected
 */

/**
 * @typedef {Object} MenuTitle
 * @property {'text'|'image'} type
 * @property {string} value When `type` = "text"
 * it's the value of the text. When `type` = "image", it's the key of the image.
 */

/**
 * @typedef {Object} Menu
 * @property {string} [parent] `key` of the previous menu that led to this one
 * @property {GameObjects.Container} [customContent]
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
  /** @type {string} */
  firstMenuKey;
  /** @type {Menu} */
  _currentMenu;
  /** @type {GameObjects.Container} */
  _currentMenuContainer;
  /** @type {GameObjects.Container} */
  _currentFooterContainer;
  /** @type {Tweens.Tween} */
  _titleTween;

  /**
   * @param {Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * @param {Array<Menu>} menus
   * @param {string} firstMenuKey
   */
  start(menus, firstMenuKey) {
    this.firstMenuKey = firstMenuKey;
    this.menuMap = new Map();
    this._titleTween;

    for (const menu of menus) {
      this.menuMap.set(menu.key, menu);
    }

    if (this.menuMap.size < 1) {
      return;
    }

    this._currentMenu = this.menuMap.get(firstMenuKey);
    this._currentMenuContainer = this.scene.add.container(0, 0);
    this._currentMenuContainer.add(this._renderMenu(this._currentMenu));
    recentreMenu(this.scene, this._currentMenuContainer);
    this._currentFooterContainer = this.scene.add.container(
      0,
      this.scene.cameras.main.height,
    );

    this._currentFooterContainer.add(this._renderFooter(this._currentMenu));
    realignFooter(this.scene, this._currentFooterContainer);
  }

  /**
   * @param {string} key - Key of menu to switch to
   */
  async push(key) {
    this.shutDownCurrentMenu();
    const nextMenuContainer = this.scene.add.container(0, 0);
    const nextMenu = this.menuMap.get(key);

    nextMenuContainer.add(this._renderMenu(nextMenu));
    recentreMenu(this.scene, nextMenuContainer);

    const nextFooterContainer = this.scene.add.container(
      0,
      this.scene.cameras.main.height,
    );
    nextFooterContainer.add(this._renderFooter(nextMenu));
    realignFooter(this.scene, nextFooterContainer);

    const sceneWidth = this.scene.cameras.main.width;
    const pushTweenPromise = new Promise((resolve) =>
      this.scene.tweens.addMultiple([
        {
          targets: [this._currentMenuContainer, this._currentFooterContainer],
          x: -sceneWidth,
          duration: 500,
          ease: 'back',
        },
        {
          targets: [nextMenuContainer, nextFooterContainer],
          x: { from: sceneWidth, to: 0 },
          duration: 500,
          ease: 'back',
          onComplete: () => resolve(),
        },
      ]),
    );

    await pushTweenPromise;
    this._currentMenuContainer.destroy();
    this._currentMenuContainer = nextMenuContainer;
    this._currentFooterContainer = nextFooterContainer;
    this._currentMenu = nextMenu;
  }

  shutDownCurrentMenu() {
    // 1. Disable title tween
    this._titleTween.destroy();

    // 2. Disable menu item events
    const menuItemsLength = this._currentMenu.items.length;
    for (let i = 0; i < menuItemsLength; i++) {
      const menuItem = this._currentMenu.items[i];
      if (menuItem.isInteractive) {
        const menuItemGameObject = this._currentMenuContainer.getAt(i);
        menuItemGameObject.off('pointerover', onButtonHover);
        menuItemGameObject.off('pointerout', onButtonOut);
        if (menuItem.action) {
          menuItemGameObject.off('pointerup', menuItem.action, this.scene);
        }
      }
    }

    // 3. TODO: Disable menu footer item events
  }

  async pop() {
    this.shutDownCurrentMenu();
    const nextMenuContainer = this.scene.add.container(0, 0);
    const nextMenu = this.menuMap.get(this._currentMenu.parent);

    nextMenuContainer.add(this._renderMenu(nextMenu));
    recentreMenu(this.scene, nextMenuContainer);

    const nextFooterContainer = this.scene.add.container(
      0,
      this.scene.cameras.main.height,
    );
    nextFooterContainer.add(this._renderFooter(nextMenu));
    realignFooter(this.scene, nextFooterContainer);

    const sceneWidth = this.scene.cameras.main.width;
    const popTweenPromise = new Promise((resolve) =>
      this.scene.tweens.addMultiple([
        {
          targets: [this._currentMenuContainer, this._currentFooterContainer],
          x: sceneWidth,
          duration: 500,
          ease: 'back',
        },
        {
          targets: [nextMenuContainer, nextFooterContainer],
          x: { from: -sceneWidth, to: 0 },
          duration: 500,
          ease: 'back',
          onComplete: () => resolve(),
        },
      ]),
    );

    await popTweenPromise;
    this._currentMenuContainer.destroy();
    this._currentMenuContainer = nextMenuContainer;
    this._currentMenu = nextMenu;
  }

  /**
   *
   * @param {Menu} menu
   * @param {*} options
   * @returns
   */
  _renderMenu(menu, options) {
    const title = this._createTitle(menu.title);
    this._titleTween = this.scene.tweens.add({
      targets: [title],
      ...HOVER_TWEEN_CONFIG,
    });

    let lastRenderedItem;
    lastRenderedItem = title;

    const summary = menu.summary
      ? this._renderSummary(menu.summary, lastRenderedItem)
      : null;
    if (menu.summary) {
      lastRenderedItem = summary;
    }

    const customContent = menu.customContent ?? null;
    if (menu.customContent) {
      customContent.y = lastRenderedItem.y + lastRenderedItem.height + 12;
      lastRenderedItem = customContent;
    }

    const menuItems = menu.items.map((menuItem, index) => {
      const renderedItem = this._renderMenuItem(
        menuItem,
        lastRenderedItem,
        index,
        !!menu.summary || !!menu.customContent,
      );

      lastRenderedItem = renderedItem;
      return renderedItem;
    });

    return [title, summary, customContent, ...menuItems].filter(
      (item) => !!item,
    );
  }

  _renderSummary(summary, lastRenderedItem) {
    const y = lastRenderedItem.y + lastRenderedItem.height;

    return this.scene.add
      .text(this.scene.cameras.main.width / 2, y, summary, {
        fontFamily: 'usuzi',
        fontSize: 24,
        color: COLORS.foreground,
      })
      .setOrigin(0.5, 0);
  }

  /**
   *
   * @param {MenuTitle} titleData
   */
  _createTitle(titleData) {
    const sceneWidth = this.scene.cameras.main.width;
    switch (titleData.type) {
      case 'text': {
        return this.scene.add
          .text(sceneWidth / 2, 0, titleData.value, {
            fontFamily: 'usuzi',
            fontSize: 40,
            align: 'center',
            wordWrap: {
              width: sceneWidth - 100,
            },
          })
          .setOrigin(0.5, 0);
      }
      case 'image': {
        return this.scene.add
          .image(sceneWidth / 2, 0, titleData.value)
          .setOrigin(0.5, 0);
      }
      default:
        throw new Error(`Unknown menu title type: ${titleData.type}`);
    }
  }

  _renderCustomContent(summary, lastRenderedItem) {
    const y = lastRenderedItem.y + lastRenderedItem.height / 2 + 48;

    return this.scene.add
      .text(this.scene.cameras.main.width / 2, y, summary, {
        fontFamily: 'usuzi',
        fontSize: 24,
        color: COLORS.foreground,
      })
      .setOrigin(0.5, 0);
  }

  /**
   *
   * @param {MenuItem} menuItem
   * @param {*} lastRenderedItem
   */
  _renderMenuItem(menuItem, lastRenderedItem, index, hasSummary = false) {
    // The height of a Container game object need to be calculated dynamically using `Container.getBounds()`
    const lastRenderedItemHeight =
      lastRenderedItem.getBounds?.().height ?? lastRenderedItem.height;
    const firstItemOffset = hasSummary ? 32 : 36;
    const y =
      lastRenderedItem.y +
      (index === 0 ? lastRenderedItemHeight + firstItemOffset : 32);

    const menuItemGameObject = this.scene.add
      .text(this.scene.cameras.main.width / 2, y, menuItem.label, {
        fontFamily: 'usuzi',
        fontSize: 24,
        color: COLORS.foreground,
      })
      .setOrigin(0.5, 0);

    if (menuItem.isInteractive === undefined || menuItem.isInteractive) {
      menuItemGameObject.setInteractive(MENU_ITEM_CONFIG);
      menuItemGameObject.on('pointerover', onButtonHover);
      menuItemGameObject.on('pointerout', onButtonOut);
      if (menuItem.action) {
        menuItemGameObject.on('pointerup', menuItem.action, this.scene);
      }
    }

    return menuItemGameObject;
  }

  /**
   *
   * @param {Menu} menu
   * @param {*} options
   * @returns
   */
  _renderFooter(menu, options) {
    let lastRenderedItem = null;

    return menu.footerItems
      ? menu.footerItems.map((footerItem, index) => {
          const renderedItem = this._renderFooterItem(
            footerItem,
            lastRenderedItem,
            index,
          );

          lastRenderedItem = renderedItem;
          return renderedItem;
        })
      : [];
  }

  /**
   *
   * @param {MenuItem} footerItem
   * @param {*} lastRenderedItem
   */
  _renderFooterItem(footerItem, lastRenderedItem, index) {
    // The height of a Container game object need to be calculated dynamically using `Container.getBounds()`
    const lastRenderedItemHeight = lastRenderedItem
      ? (lastRenderedItem.getBounds?.().height ?? lastRenderedItem.height)
      : 0;
    const firstItemOffset = 60;
    const y = lastRenderedItem
      ? lastRenderedItem.y +
        (index === 0 ? lastRenderedItemHeight + firstItemOffset : 32)
      : 0;

    const footerItemObject = this.scene.add
      .text(this.scene.cameras.main.width / 2, y, footerItem.label, {
        fontFamily: 'usuzi',
        fontSize: 16,
        color: COLORS.foreground,
      })
      .setOrigin(0.5, 0);

    if (footerItem.isInteractive === undefined || footerItem.isInteractive) {
      footerItemObject.setInteractive(MENU_ITEM_CONFIG);
      footerItemObject.on('pointerover', onButtonHover);
      footerItemObject.on('pointerout', onButtonOut);
      if (footerItem.action) {
        footerItemObject.on('pointerup', footerItem.action, this.scene);
      }
    }

    return footerItemObject;
  }
}

function onButtonHover() {
  this.setColor(COLORS.hoverForeground);
}

function onButtonOut() {
  this.setColor(COLORS.foreground);
}

function recentreMenu(scene, menuContainer) {
  const bounds = menuContainer.getBounds();
  const heightDifference = scene.cameras.main.height - bounds.height;
  if (heightDifference < 0) {
    return;
  }

  menuContainer.y = heightDifference / 2;
}

function realignFooter(scene, footerContainer) {
  const bounds = footerContainer.getBounds();
  footerContainer.y = scene.cameras.main.height - bounds.height - 20;
}
