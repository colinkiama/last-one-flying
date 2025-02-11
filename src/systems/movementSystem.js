import { Math as PhaserMath } from 'phaser';
import { createMovementKeys } from '../utils/input.js';
import {
  MovementType,
  POINTER_DEADZONE,
  PLAYER_ROTATION_SPEED,
  PLAYER_MOVEMENT_SPEED,
  MIN_JOYSTICK_FORCE
} from '../constants/movement.js';

export class MovementSystem {
  scene;
  _player;
  _keyboardCursorKeys;
  _leftJoystick;
  _rightJoystick;
  _leftJoystickCursorKeys;
  _movementType;

  constructor(scene, player, movementSystem) {
    this.scene = scene;
    this._player = player;
    this._keyboardCursorKeys = createMovementKeys(this.scene.input.keyboard);
    this._leftJoystick = movementSystem.leftJoystick;
    this._leftJoystickCursorKeys = this._leftJoystick.createCursorKeys();

    this._rightJoystick = movementSystem.rightJoystick;
  }

  get movementType() {
    return this._movementType;
  }

  activatePointerMovement() {
    this.scene.input.on('pointermove', this.onPointerMove, this);
    this._movementType = MovementType.NON_TOUCH;
  }

  activateJoystickMovement() {
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this._movementType = MovementType.TOUCH;
  }

  handlePlayerMovement() {
    if (this._movementType === MovementType.TOUCH) {
      this.handleRightJoystickMovement();
      this.handleKeyMovement(this._leftJoystickCursorKeys);
    } else {
      this.handleKeyMovement(this._keyboardCursorKeys);
    }

    this.updatePlayerBody();
  }

  handleKeyMovement(cursorKeys) {
    const { up, down, left, right } = cursorKeys;

    if (this._movementType === MovementType.NON_TOUCH) {
      if (left.isDown) {
        this._player.setAngularVelocity(-PLAYER_ROTATION_SPEED);
      } else if (right.isDown) {
        this._player.setAngularVelocity(PLAYER_ROTATION_SPEED);
      } else {
        this._player.setAngularVelocity(0);
      }
    }

    if (up.isDown) {
      this.scene.physics.velocityFromRotation(
        this._player.rotation,
        PLAYER_MOVEMENT_SPEED,
        this._player.body.velocity,
      );
    } else if (down.isDown) {
      this.scene.physics.velocityFromRotation(
        this._player.rotation,
        -PLAYER_MOVEMENT_SPEED,
        this._player.body.velocity,
      );
    } else {
      this._player.setVelocity(0);
    }
  }

  handleRightJoystickMovement() {
    if (this._rightJoystick.force > MIN_JOYSTICK_FORCE) {
      this._player.setRotation(this._rightJoystick.rotation);
    } else {
      this._player.setVelocity(0);
    }

    this.updatePlayerBody();
  }

  updatePlayerBody() {
    // Set body size based on rotation boundaries (due to limitation of arcade physics body not supporting rotation)
    const verticalBoundaries = [Math.PI / 2, -Math.PI / 2];
    const horizontalBoundaries = [0, -Math.PI, Math.PI];

    let verticalDifference = Number.MAX_VALUE;
    let horizontalDifference = Number.MAX_VALUE;

    verticalDifference = verticalBoundaries
      .map((num) => Math.abs(this._player.rotation - num))
      .reduce((lastValue, currentValue) => {
        return currentValue < lastValue ? currentValue : lastValue;
      }, Number.MAX_VALUE);

    horizontalDifference = horizontalBoundaries
      .map((num) => Math.abs(this._player.rotation - num))
      .reduce((lastValue, currentValue) => {
        return currentValue < lastValue ? currentValue : lastValue;
      }, Number.MAX_VALUE);

    if (verticalDifference < horizontalDifference) {
      if (this._player.body.width !== 24) {
        this._player.setBodySize(24, 32, 8);
      }
    } else if (this._player.body.width.x !== 32) {
      this._player.setBodySize(32, 24, 8);
    }

    this.scene.physics.world.wrap(this._player, this._player.width / 2);
  }

  onPointerMove(pointer) {
    if (this.isInDeadzone(pointer.worldX, pointer.worldY)) {
      return;
    }

    const targetAngle = PhaserMath.Angle.Between(
      this._player.x,
      this._player.y,
      pointer.worldX,
      pointer.worldY,
    );
    this._player.setRotation(targetAngle);
  }

  isInDeadzone(x, y) {
    return (
      x >= this._player.x - POINTER_DEADZONE &&
      x <= this._player.x + POINTER_DEADZONE &&
      y >= this._player.y - POINTER_DEADZONE &&
      y <= this._player.y + POINTER_DEADZONE
    );
  }
}
