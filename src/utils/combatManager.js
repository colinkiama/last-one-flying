export class CombatManager {
    scene,
    _player,
    _enemyPool
    _explosionPool;
    _laserBeamPool

    constructor (scene, player, pools) {
        const { enemyPool, laserBeamPool, explosionPool } = pools;
        this.scene = scene;
        this._player = player;
        this._enemyPool = enemyPool;
        this._explosionPool = explosionPool;
        this._laserBeamPool = laserBeamPool;
    }

    activateCollisons () {
         this.physics.add.overlap(
            this._enemyPool,
            this._laserBeamPool,
            (enemy, laserBeam) => {
                explodeShip(this._explosions.get(), enemy);
                this.updateScore('enemy-hit');
                this.cameras.main.shake(200, 0.01);
                laserBeam.disableBody(true, true);
                this._last_enemy_hit_time = this.time.now;
            }
        )

        this.physics.add.collider(
            this._enemyPool,
            this._player,
            (enemy, player) => {
                explodeShip(this._explosions.get(), enemy);
                const activeEnemies = this._enemyPool.getMatching('active', true);
                const closestEnemy = activeEnemies.reduce((lastEnemy, currentEnemy, index) => {
                    if (!lastEnemy) {
                        return currentEnemy;
                    }

                    return Math.abs(player.x - currentEnemy.x) < Math.abs(player.x - lastEnemy.x) ? currentEnemy : lastEnemy;
                }, null);

                explodeShip(this._explosions.get(), player);
                this.cameras.main.shake(500, 0.01);
                this._spawnManager.spawnPlayer({ enemy: closestEnemy });
            }
        )

        this.physics.add.overlap(
            this._player,
            this._enemyLaserBeams,
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

                explodeShip(this._explosions.get(), player);
                this.cameras.main.shake(500, 0.01);
                laserBeam.disableBody(true, true);
                this._spawnManager.spawnPlayer({ enemy: closestEnemy });
            }
        )
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
