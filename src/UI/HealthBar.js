import { GameObjects } from "phaser";
import { HealthPoint } from "./HealthPoint";
import { STARTING_LIVES, HEALTH_POINT_DIMENSIONS, HEALTH_ICON_DIMENSIONS } from "../constants";

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
}