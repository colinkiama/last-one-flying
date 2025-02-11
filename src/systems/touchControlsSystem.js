export class TouchControlsSystem {
  leftJoystick;
  rightJoystick;
  _isRightJoystickPressed;

  constructor(leftJoystick, rightJoystick) {
    this.leftJoystick = leftJoystick;
    this.rightJoystick = rightJoystick;
    this._isRightJoystickPressed = false;
    this.setupEvents();
  }

  set visible(isVisible) {
    this._visible = isVisible;
    this.leftJoystick.visible = isVisible;
    this.rightJoystick.visible = isVisible;
  }

  get isRightJoystickPressed() {
    return this._isRightJoystickPressed;
  }

  setupEvents() {
    this.rightJoystick
      .on('pointerdown', () => {
        this._isRightJoystickPressed = true;
      })
      .on('pointerup', () => {
        this._isRightJoystickPressed = false;
      });
  }
}
