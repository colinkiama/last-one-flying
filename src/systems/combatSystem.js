import { gameLogicEventEmitter, createCombatKeys, } from '../utils';
import { GameLogicEvent, LASER_SHOT_DELAY } from '../constants';
import { Math as PhaserMath, Time } from 'phaser';

export class CombatSystem {
    scene;
    _player;
    _enemyPool;
    _explosionPool;
    _laserBeamPool;
    _enemyLaserBeamPool;

    _enemyAutoFireEvent;
    _combatKeys;
    _nextShotTime;
    _solarBeam;

    constructor (scene, player, pools) {
        const { enemyPool, laserBeamPool, enemyLaserBeamPool, explosionPool } = pools;
        this.scene = scene;
        this._player = player;
        this._enemyPool = enemyPool;
        this._explosionPool = explosionPool;
        this._laserBeamPool = laserBeamPool;
        this._enemyLaserBeamPool = enemyLaserBeamPool;

        this._combatKeys = createCombatKeys(this.scene.input.keyboard);
        this._nextShotTime = 0;
    }

    activateCollisions () {
        this.scene.physics.add.overlap(
            this._enemyPool,
            this._laserBeamPool,
            (enemy, laserBeam) => {
                this.destroyShip(enemy);
                gameLogicEventEmitter.emit(GameLogicEvent.ENEMY_DEATH);
                laserBeam.disableBody(true, true);
            }
        )

        this.scene.physics.add.collider(
            this._enemyPool,
            this._player,
            (enemy, player) => {
                this.destroyShip(enemy);
                const activeEnemies = this._enemyPool.getMatching('active', true);
                const closestEnemy = activeEnemies.reduce((lastEnemy, currentEnemy, index) => {
                    if (!lastEnemy) {
                        return currentEnemy;
                    }

                    return Math.abs(player.x - currentEnemy.x) < Math.abs(player.x - lastEnemy.x) ? currentEnemy : lastEnemy;
                }, null);

                this.destroyShip(player);
                gameLogicEventEmitter.emit(GameLogicEvent.PLAYER_DEATH);
                gameLogicEventEmitter.emit(GameLogicEvent.ENEMY_DEATH);
            }
        )

        this.scene.physics.add.overlap(
            this._player,
            this._enemyLaserBeamPool,
            (player, laserBeam) => {
                const deathPosition = {
                    x: player.x,
                    y: player.y
                };

                const activeEnemies = this._enemyPool.getMatching('active', true);
                const closestEnemy = activeEnemies.reduce((lastEnemy, currentEnemy, index) => {
                    if (!lastEnemy) {
                        return currentEnemy;
                    }

                    return Math.abs(player.x - currentEnemy.x) < Math.abs(player.x - lastEnemy.x) ? currentEnemy : lastEnemy;
                }, null);

                this.destroyShip(player);
                laserBeam.disableBody(true, true);
                gameLogicEventEmitter.emit(GameLogicEvent.PLAYER_DEATH, closestEnemy);
            }
        )
    }


    startEnemyAI () {
        if (this._enemyAutoFireEvent) {
            return;
        }

        this._enemyAutoFireEvent = new Time.TimerEvent ({
            delay: 2000,
            loop: true,
            callback: () => {
                const activeEnemies = this._enemyPool.getMatching('active', true);
                for (let i = 0; i < activeEnemies.length; i++) {
                    const enemy = activeEnemies[i];
                    const enemyLaserBeam = this._enemyLaserBeamPool.get();

                    if (enemyLaserBeam) {
                        const rotatedShipHeadOffset = new PhaserMath.Vector2(
                            enemy.width * enemy.originX + enemyLaserBeam.width,
                            0
                        ).rotate(enemy.rotation);

                        enemyLaserBeam.fire(
                            enemy.x + rotatedShipHeadOffset.x,
                            enemy.y + rotatedShipHeadOffset.y,
                            {
                                isVertical: enemy.body.width === 24,
                                rotation: enemy.rotation
                            }
                        );
                    }
                }
            }
        });

        this.scene.time.addEvent(this._enemyAutoFireEvent);
    }

    update () {
        const { shoot, useAbility, cycleAbilities } = this._combatKeys;
        const activePointer = this.scene.input.activePointer;
        const shootButtonPressed = shoot.isDown || activePointer.primaryDown;

        if (shootButtonPressed && this.scene.time.now >= this._nextShotTime) {
            this._nextShotTime = this.scene.time.now + LASER_SHOT_DELAY;
            const laserBeam = this._laserBeamPool.get();
            if (laserBeam) {
                const rotatedShipHeadOffset = new PhaserMath.Vector2(
                    this._player.width * this._player.originX + laserBeam.width,
                    0
                ).rotate(this._player.rotation);


                // TODO: Replace with emitted "player-fire" event
                gameLogicEventEmitter.emit(GameLogicEvent.PLAYER_FIRE);
                laserBeam.fire(
                    this._player.x + rotatedShipHeadOffset.x,
                    this._player.y + rotatedShipHeadOffset.y,
                    {
                        isVertical: this._player.body.width === 24,
                        rotation: this._player.rotation
                    }
                );
            }
        }

        this.followPlayer();
    }

    followPlayer () {
        const activeEnemies = this._enemyPool.getMatching('active', true);
        const targetX = this._player.x;
        const targetY = this._player.y;

        for (let i = 0; i < activeEnemies.length; i++) {
            const enemy = activeEnemies[i];

            const targetAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);
            const rotation = Phaser.Math.Angle.RotateTo(enemy.rotation, targetAngle, 0.05 * Math.PI);
            enemy.setRotation(rotation);

            this.scene.physics.moveToObject(enemy, this._player, 40);
        }
    }

    destroyShip (ship) {
        ship.disableBody(true, true);
        gameLogicEventEmitter.emit(GameLogicEvent.SHIP_DESTROYED, ship);
    }
}

