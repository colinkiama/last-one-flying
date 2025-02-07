import { Math as PhaserMath, Time } from 'phaser';
import { gameLogicEventEmitter } from '../utils/events.js';
import { createCombatKeys } from '../utils/input.js';
import { GameLogicEvent } from '../constants/events.js';
import {
    ENEMY_LASER_BEAM_SPEED,
  ENEMY_LASER_LIFE_SPAN,
  ENEMY_MOVEMENT_SPEED,
  ENEMY_SHOT_DELAY,
  LASER_SHOT_DELAY,
} from '../constants/combat.js';
import { MovementType } from '../constants/movement.js';

export class CombatSystem {
  scene;
  _player;
  _enemyPool;
  _laserBeamPool;
  _enemyLaserBeamPool;

  _enemyAutoFireEvent;
  _combatKeys;
  _nextShotTime;
  _solarBeam;
  _touchControlsSystem;

  constructor(scene, player, pools, touchControlsSystem) {
    const { enemyPool, laserBeamPool, enemyLaserBeamPool } = pools;
    this.scene = scene;
    this._player = player;
    this._enemyPool = enemyPool;
    this._laserBeamPool = laserBeamPool;
    this._enemyLaserBeamPool = enemyLaserBeamPool;

    this._touchControlsSystem = touchControlsSystem;
    this._combatKeys = createCombatKeys(this.scene.input.keyboard);
    this._nextShotTime = 0;
  }

  activateCollisions() {
    this.scene.physics.add.overlap(
      this._enemyPool,
      this._laserBeamPool,
      (enemy, laserBeam) => {
        this.destroyShip(enemy);
        gameLogicEventEmitter.emit(GameLogicEvent.ENEMY_DEATH);
        laserBeam.disableBody(true, true);
      },
    );

    this.scene.physics.add.collider(
      this._enemyPool,
      this._player,
      (enemy, player) => {
        this.destroyShip(enemy);
        const activeEnemies = this._enemyPool.getMatching('active', true);
        const closestEnemy = activeEnemies.reduce(
          (lastEnemy, currentEnemy, index) => {
            if (!lastEnemy) {
              return currentEnemy;
            }

            return Math.abs(player.x - currentEnemy.x) <
              Math.abs(player.x - lastEnemy.x)
              ? currentEnemy
              : lastEnemy;
          },
          null,
        );

        this.destroyShip(player);
        gameLogicEventEmitter.emit(GameLogicEvent.ENEMY_DEATH);
        gameLogicEventEmitter.emit(GameLogicEvent.PLAYER_DEATH);
      },
    );

    this.scene.physics.add.overlap(
      this._player,
      this._enemyLaserBeamPool,
      (player, laserBeam) => {
        const deathPosition = {
          x: player.x,
          y: player.y,
        };

        const activeEnemies = this._enemyPool.getMatching('active', true);
        const closestEnemy = activeEnemies.reduce(
          (lastEnemy, currentEnemy, index) => {
            if (!lastEnemy) {
              return currentEnemy;
            }

            return Math.abs(player.x - currentEnemy.x) <
              Math.abs(player.x - lastEnemy.x)
              ? currentEnemy
              : lastEnemy;
          },
          null,
        );

        this.destroyShip(player);
        laserBeam.disableBody(true, true);
        gameLogicEventEmitter.emit(GameLogicEvent.PLAYER_DEATH, closestEnemy);
      },
    );
  }

  startEnemyAI() {
    if (this._enemyAutoFireEvent) {
      return;
    }

    this._enemyAutoFireEvent = new Time.TimerEvent({
      delay: ENEMY_SHOT_DELAY,
      loop: true,
      callback: () => {
        const activeEnemies = this._enemyPool.getMatching('active', true);
        for (let i = 0; i < activeEnemies.length; i++) {
          const enemy = activeEnemies[i];
          const enemyLaserBeam = this._enemyLaserBeamPool.get(
            0,
            0,
            'enemy-laser-beam',
          );

          if (enemyLaserBeam) {
            const rotatedShipHeadOffset = new PhaserMath.Vector2(
              enemy.width * enemy.originX + enemyLaserBeam.width,
              0,
            ).rotate(enemy.rotation);

            enemyLaserBeam.fire(
              enemy.x + rotatedShipHeadOffset.x,
              enemy.y + rotatedShipHeadOffset.y,
              {
                isVertical: enemy.body.width === 24,
                rotation: enemy.rotation,
                laserBeamSpeed: ENEMY_LASER_BEAM_SPEED,
                lifespan: ENEMY_LASER_LIFE_SPAN
              },
            );
          }
        }
      },
    });

    this.scene.time.addEvent(this._enemyAutoFireEvent);
  }

  update(movementType) {
    const { shoot } = this._combatKeys;
    const activePointer = this.scene.input.activePointer;

    const shootButtonPressed =
      shoot.isDown ||
      (movementType === MovementType.TOUCH
        ? this._touchControlsSystem.isFireButtonDown
        : activePointer.primaryDown);

    const shotDelayTmeElapsed = this.scene.time.now >= this._nextShotTime;
    const canShoot =
      this._player.active && shootButtonPressed && shotDelayTmeElapsed;

    if (canShoot) {
      this._nextShotTime = this.scene.time.now + LASER_SHOT_DELAY;
      const laserBeam = this._laserBeamPool.get(0, 0, 'laser-beam');
      if (laserBeam) {
        const rotatedShipHeadOffset = new PhaserMath.Vector2(
          this._player.width * this._player.originX + laserBeam.width,
          0,
        ).rotate(this._player.rotation);

        gameLogicEventEmitter.emit(GameLogicEvent.PLAYER_FIRE);
        laserBeam.fire(
          this._player.x + rotatedShipHeadOffset.x,
          this._player.y + rotatedShipHeadOffset.y,
          {
            isVertical: this._player.body.width === 24,
            rotation: this._player.rotation,
          },
        );
      }
    }

    if (!this._player.active) {
      return;
    }

    this.followPlayer();
  }

  followPlayer() {
    const activeEnemies = this._enemyPool.getMatching('active', true);
    const targetX = this._player.x;
    const targetY = this._player.y;

    for (let i = 0; i < activeEnemies.length; i++) {
      const enemy = activeEnemies[i];

      const targetAngle = PhaserMath.Angle.Between(
        enemy.x,
        enemy.y,
        targetX,
        targetY,
      );
      const rotation = PhaserMath.Angle.RotateTo(
        enemy.rotation,
        targetAngle,
        0.05 * Math.PI,
      );
      enemy.setRotation(rotation);

      this.scene.physics.moveToObject(
        enemy,
        this._player,
        ENEMY_MOVEMENT_SPEED,
      );
    }
  }

  destroyShip(ship) {
    ship.disableBody(true, true);
    gameLogicEventEmitter.emit(GameLogicEvent.SHIP_DESTROYED, ship);
  }
}
