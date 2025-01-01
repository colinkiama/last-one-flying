export class TouchControlsSystem {
  joystick;
  // { fire: GameObject }
  buttons;
  _visible;
  _isFireButtonDown;

  constructor(joystick, buttons) {
    this.joystick = joystick;
    this.buttons = buttons;
    this._isFireButtonDown = false;
    this.setupEvents();
  }

  set visible(isVisible) {
    this._visible = isVisible;
    this.joystick.visible = isVisible;

    for (const key in this.buttons) {
      const button = this.buttons[key];
      if (isVisible) {
        button.setVisible(isVisible).setInteractive();
      } else {
        button.setVisible(isVisible).disableInteractive();
      }
    }
  }

  get isFireButtonDown() {
    return this._isFireButtonDown;
  }

  setupEvents() {
    this.buttons.fire
      .setInteractive()
      .on('pointerdown', () => {
        this._isFireButtonDown = true;
      })
      .on('pointerup', () => {
        this._isFireButtonDown = false;
      });
  }
}
