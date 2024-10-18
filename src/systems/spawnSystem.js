import { Math as PhaserMath } from 'phaser';

const ENEMY_SPAWN_COOLDOWN = 2500 // in milliseconds;

export class SpawnSystem {
    scene;
    player;
    _enemyGroup;
    _last_enemy_hit_time;

    constructor (scene, enemyGroup) {
        this.scene = scene;
        this.player = this.spawnPlayer();
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
        const xPosition1 = PhaserMath.RND.between(0, this.player.x - minDistanceToPlayer);
        const xPosition2 = PhaserMath.RND.between(this.player.x + minDistanceToPlayer, this.scene.cameras.main.width);

        let enemyX = PhaserMath.RND.frac() >= 0.5 ? xPosition2 : xPosition1;
        let enemyY = Phaser.Math.RND.between(startingEnemy.height, this.scene.cameras.main.height - startingEnemy.height);

        startingEnemy.spawn(enemyX, enemyY);
    }

    spawnPlayer (payload) {
        const { enemy: enemy = null } = payload ?? {};
        if (!this.player) {
            return this.scene.physics.add.sprite(320, 180, 'player').setBodySize(32,24, 8).setOrigin(0.5, 0.5);
        }

        if (!enemy) {
            this.player.enableBody(true, 320, PhaserMath.RND.between(100, 300), true, true);
            return;
        }

        const minDistanceFromEnemy = 200;

        // 50% of being left or right of enemy.
        const xPosition1 = PhaserMath.RND.between(0, enemy.x - minDistanceFromEnemy);
        const xPosition2 = PhaserMath.RND.between(enemy.x + minDistanceFromEnemy, this.scene.cameras.main.width);

        let playerX = PhaserMath.RND.frac() >= 0.5 ? xPosition2 : xPosition1;
        let playerY = Phaser.Math.RND.between(this.player.height, this.scene.cameras.main.height - this.player.height);

        this.player.enableBody(true, playerX, playerY, true, true);
    }

    updateLastHitTime (time) {
        this._last_enemy_hit_time = time;
    }


}
