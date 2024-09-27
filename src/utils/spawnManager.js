import { Math as PhaserMath } from 'phaser';

const ENEMY_SPAWN_COOLDOWN = 2500 // in milliseconds;

export class SpawnManager {
    scene;
    _player;
    _enemyGroup;
    _last_enemy_hit_time;

    constructor (scene, player, enemyGroup) {
        this.scene = scene;
        this._player = player;
        this._enemyGroup = enemyGroup;
        this._last_enemy_hit_time = 0;
    }

    spawn () {
        const activeEnemies = this._enemyGroup.getMatching('active', true);
        if (activeEnemies.length > 0 || this.scene.time.now - this._last_enemy_hit_time < ENEMY_SPAWN_COOLDOWN) {
            return;
        }

        const startingEnemy = this._enemyGroup.get();
        if (!startingEnemy) {
            return;
        }

        const minDistanceToPlayer = 200;
        // 50% of being left of player or right of player.
        const xPosition1 = PhaserMath.RND.between(0, this._player.x - minDistanceToPlayer);
        const xPosition2 = PhaserMath.RND.between(this._player.x + minDistanceToPlayer, this.scene.cameras.main.width);

        let enemyX = PhaserMath.RND.frac() >= 0.5 ? xPosition2 : xPosition1;
        let enemyY = Phaser.Math.RND.between(startingEnemy.height, this.scene.cameras.main.height - startingEnemy.height);

        startingEnemy.spawn(enemyX, enemyY);
    }

    updateLastHitTime (time) {
        this._last_enemy_hit_time = time;
    }
}
