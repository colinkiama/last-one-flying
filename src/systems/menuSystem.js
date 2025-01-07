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
 * @property {MenuTitle} title - The content that appears on the top of the menu
 * @property {string} summary
 * @property {Array<MenuItem>} items
 * @property {(Array<MenuItem>|undefined)} footerItems
 */

