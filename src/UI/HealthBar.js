import { GameObjects } from 'phaser';
import { HealthPoint } from "./HealthPoint.js";
import { STARTING_LIVES } from "../constants/status.js";
import { HEALTH_ICON_DIMENSIONS, HEALTH_POINT_DIMENSIONS } from "../constants/HUD.js";

export class HealthBar extends GameObjects.Container {
    _pointPool;

    constructor(scene, x, y) {
        super(scene, x, y);
        this._pointPool = this.scene.add.group({
            classType: HealthPoint,
            maxSize: STARTING_LIVES
        });

        for (let i = 0; i < STARTING_LIVES; i++) {
            this._pointPool.get(
                this.x + (HEALTH_POINT_DIMENSIONS.width / 2) + (i * (HEALTH_ICON_DIMENSIONS.width + HEALTH_POINT_DIMENSIONS.horizontalMargin)),
                this.y,
                'health-point'
            );
        }
    }

    setLives(nextLivesValue) {
        const healthPoints = this._pointPool.getChildren();
        const length = healthPoints.length;

        for (let i = 0; i < length; i++) {
            const healthPoint = healthPoints[i];
            if (i < nextLivesValue) {
                healthPoint.illuminate();
            } else {
                healthPoint.dim()
            }

            if (i === 0 && nextLivesValue === 1) {
                healthPoint.flicker();
            }
        }
    }
}