import { COLORS } from '../constants/menu.js';

export function onButtonHover() {
  this.setColor(COLORS.hoverForeground);
}

export function onButtonOut() {
  this.setColor(COLORS.foreground);
}
