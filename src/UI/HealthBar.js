import { GameObjects } from 'phaser';
import { binarySearchFind } from '../utils/arr.js';
import { HealthPoint } from './HealthPoint.js';
import {
  HEALTH_ICON_DIMENSIONS,
  HEALTH_POINT_DIMENSIONS,
} from '../constants/HUD.js';

export class HealthBar extends GameObjects.Container {
  _pointPool;
  _lives;

  constructor(scene, x, y, lives) {
    super(scene, x, y);
    this._lives = lives;

    this._pointPool = this.scene.add.group({
      classType: HealthPoint,
      maxSize: lives,
    });

    for (let i = 0; i < lives; i++) {
      this._pointPool.get(
        this.x +
          HEALTH_POINT_DIMENSIONS.width / 2 +
          i *
            (HEALTH_ICON_DIMENSIONS.width +
              HEALTH_POINT_DIMENSIONS.horizontalMargin),
        this.y,
        'health-point',
        i < this._lives ? 0 : 1,
      );
    }
  }

  setLives(nextLivesValue) {
    const healthPoints = this._pointPool.getChildren();
    this._lives = this._updateLives(nextLivesValue, healthPoints);
    if (nextLivesValue === 1) {
      healthPoints[0].flicker();
    }
  }

  _updateLives(nextLivesValue, healthPoints) {
    if (this._lives === nextLivesValue) {
      return this._lives;
    }

    // Handle special case
    if (!healthPoints[0].isLit()) {
      for (let i = 0; i < nextLivesValue; i++) {
        healthPoints[i].illuminate();
      }

      return nextLivesValue;
    }

    // Binary search solution
    const lastLitElementIndex = binarySearchFind(
      healthPoints,
      compareForLastLitElement,
    );
    const difference = nextLivesValue - 1 - lastLitElementIndex;

    if (difference === 0) {
      // There's no change
      return this._lives;
    }

    const loopEnd = Math.abs(difference);
    const isReversed = difference < 0;

    for (let i = 0; i < loopEnd; i++) {
      const healthPoint =
        healthPoints[
          lastLitElementIndex + (isReversed ? 0 : 1) + i * (isReversed ? -1 : 1)
        ];
      if (isReversed) {
        healthPoint.dim();
      } else {
        healthPoint.illuminate();
      }
    }

    return nextLivesValue;
  }
}

function compareForLastLitElement(index, arr) {
  const currentElement = arr[index];
  const currentElementIsLit = currentElement.isLit();
  // Check if the current element is last lit element
  if (
    currentElementIsLit &&
    (index === arr.length - 1 || !arr[index + 1].isLit())
  ) {
    return 0;
  }

  // The last lit element may be after this current element
  if (currentElementIsLit && arr[index].isLit()) {
    return 1;
  }

  // We can assume that current element isn't lit at this point
  // The last lit element may be before the current element.
  return -1;
}
