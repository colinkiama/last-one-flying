import { gameLogicEventEmitter } from '../utils';
import { GameLogicEvent } from '../constants';
import { Math as PhaserMath, Time } from 'phaser';

export class CombatManager {
    scene;
    _player;
    _enemyPool;
    _explosionPool;
    _laserBeamPool;
    _enemyLaserBeamPool;
    _enemyAutoFireEvent;

    constructor (scene, player, pools) {
        const { enemyPool, laserBeamPool, enemyLaserBeamPool, explosionPool } = pools;
        this.scene = scene;
        this._player = player;
        this._enemyPool = enemyPool;
        this._explosionPool = explosionPool;
        this._laserBeamPool = laserBeamPool;
        this._enemyLaserBeamPool = enemyLaserBeamPool;
    }

    activateCollisions () {
         this.scene.physics.add.overlap(
            this._enemyPool,
            this._laserBeamPool,
            (enemy, laserBeam) => {
                explodeShip(this._explosionPool.get(), enemy);
                gameLogicEventEmitter.emit(GameLogicEvent.ENEMY_DEATH);
                laserBeam.disableBody(true, true);
            }
        )

        this.scene.physics.add.collider(
            this._enemyPool,
            this._player,
            (enemy, player) => {
                explodeShip(this._explosionPool.get(), enemy);
                const activeEnemies = this._enemyPool.getMatching('active', true);
                const closestEnemy = activeEnemies.reduce((lastEnemy, currentEnemy, index) => {
                    if (!lastEnemy) {
                        return currentEnemy;
                    }

                    return Math.abs(player.x - currentEnemy.x) < Math.abs(player.x - lastEnemy.x) ? currentEnemy : lastEnemy;
                }, null);

                explodeShip(this._explosionPool.get(), player);
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

                explodeShip(this._explosionPool.get(), player);
                laserBeam.disableBody(true, true);
                gameLogicEventEmitter.emit(GameLogicEvent.PLAYER_DEATH, closestEnemy);
            }
        )
    }


    startEnemyAI () {
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

        this._enemySpawnTimerEvent = new Time.TimerEvent({
            delay: 500,
            startAt: 500,
            loop: true,
            callback: () => {
                this._spawnManager.spawn()
            }
        })

        this.scene.time.addEvent(this._enemyAutoFireEvent);
    }
}

function explodeShip (explosion, ship) {
    // In scenarios where there are no inactive items in the explosions pool, you
    // don't display an explosion.
    if (!explosion) {
        return;
    }

    ship.disableBody(true, true);

    explosion
    .enable()
    .setConfig({
        lifespan: 1000,
        speed: { min: 150, max: 250 },
        scale: { start: 2, end: 0 },
        gravityY: 150,
        emitting: false,
        texture: 'explosion'
    }).explode(20, ship.x, ship.y);
}
