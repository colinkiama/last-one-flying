import { Math as PhaserMath, Time } from 'phaser';
import { WaveDifficulty } from '../constants/spawn.js';
import { ENEMY_HEIGHT } from '../constants/combat.js';

export class SpawnSystem {
    scene;
    _player;
    _enemyGroup;
    _last_enemy_hit_time;
    _enemySpawnTimerEvent;
    _enemySpawnCondition;
    _currentEnemyWave;

    constructor (scene, player, enemyGroup) {
        this.scene = scene;
        this._player = player;
        this._enemyGroup = enemyGroup;
        this._last_enemy_hit_time = 0;
        this._currentEnemyWave = 0;
        this._enemySpawnCondition = this.getEasySpawnConditions();
    }

    activateEnemySpawnTimer() {
        if (this._enemySpawnTimerEvent) {
            return;
        }

        this._enemySpawnTimerEvent = new Time.TimerEvent({
            delay: 100,
            startAt: 100,
            loop: true,
            callback: () => {
                this.spawnEnemies();
            }
        })

        this.scene.time.addEvent(this._enemySpawnTimerEvent);
    }

    deactivateEnemySpawnTimer() {
        if (!this._enemySpawnTimerEvent) {
            return;
        }

        this.scene.time.removeEvent(this._enemySpawnTimerEvent);
    }

    reset() {
        this._currentEnemyWave = 0;
        this._enemySpawnCondition = this.getEasySpawnConditions();
        this.spawnPlayer();
        this.scene.time.addEvent(this._enemySpawnTimerEvent)
    }

    spawnEnemies () {
        const { triggerInfo, spawnInfo } = this._enemySpawnCondition;
        const activeEnemies = this._enemyGroup.getMatching('active', true);
        if (activeEnemies.length > 0 || (this.scene.time.now - this._last_enemy_hit_time) < triggerInfo.spawnCooldown) {
            return;
        }

        this._currentEnemyWave++;

        const minDistanceToPlayer = 200;
        // 50% of being left of player or right of player.
        const xPosition1 = PhaserMath.RND.between(0, this._player.x - minDistanceToPlayer);
        const xPosition2 = PhaserMath.RND.between(this._player.x + minDistanceToPlayer, this.scene.cameras.main.width);


        let enemyX = PhaserMath.RND.frac() >= 0.5 ? xPosition2 : xPosition1;
        let enemyY = PhaserMath.RND.between(ENEMY_HEIGHT, this.scene.cameras.main.height - ENEMY_HEIGHT);

        const enemiesToSpawn = spawnInfo.numberOfEnemiesToSpawn;
        for (let i = 0; i < enemiesToSpawn; i++) {
            const enemy = this._enemyGroup.get();
            if (!enemy) {
                break;
            }

            const spawnOffsetX = PhaserMath.RND.between(0,250);
            const spawnOffsetY = PhaserMath.RND.between(0,250);
            enemy.spawn(enemyX + spawnOffsetX, enemyY + spawnOffsetY);
        }

        // Set new spawn condition here:
        this._enemySpawnCondition = this.prepareNextSpawnCondition();

    }

    spawnPlayer (payload) {
        const { enemy: enemy = null } = payload ?? {};

        if (!enemy) {
            this._player.spawn(320, PhaserMath.RND.between(100, 300))
            return;
        }

        const minDistanceFromEnemy = 200;

        // 50% of being left or right of enemy.
        const xPosition1 = PhaserMath.RND.between(0, enemy.x - minDistanceFromEnemy);
        const xPosition2 = PhaserMath.RND.between(enemy.x + minDistanceFromEnemy, this.scene.cameras.main.width);

        let playerX = PhaserMath.RND.frac() >= 0.5 ? xPosition2 : xPosition1;
        let playerY = PhaserMath.RND.between(this._player.height, this.scene.cameras.main.height - this._player.height);

        this._player.spawn(playerX, playerY);
    }

    updateLastEnemyHitTime (time) {
        this._last_enemy_hit_time = time;
    }

    prepareNextSpawnCondition () {
        const nextWave = this._currentEnemyWave + 1;

        if (nextWave >= WaveDifficulty.SOULSLIKE) {
            return this.getSoulslikeSpawnConditions();
        } else if (nextWave >= WaveDifficulty.HARD) {
           return this.getHardSpawnConditions();
        } else if (nextWave >= WaveDifficulty.MEDIUM) {
            return this.getMediumSpawnConditions();
        } else {
            // Assume wave difficulty is easy
            return this.getEasySpawnConditions();
        }
    }

    getEasySpawnConditions () {
        return {
            triggerInfo: {
                spawnCooldown: PhaserMath.RND.between(1000, 2500),
            },
            spawnInfo: {
                numberOfEnemiesToSpawn: PhaserMath.RND.between(1, 3)
            }
        };
    }

    getMediumSpawnConditions () {
        let numberOfEnemiesToSpawn;
        let percentage = PhaserMath.RND.frac();

        if (percentage < 0.6) {
            numberOfEnemiesToSpawn = PhaserMath.RND.between(4, 6);
        } else if (percentage < 0.9) {
            numberOfEnemiesToSpawn = PhaserMath.RND.between(1, 3);
        } else {
            numberOfEnemiesToSpawn = PhaserMath.RND.between(7, 10);
        }


        return {
            triggerInfo: {
                spawnCooldown: PhaserMath.RND.between(1000, 2500),
            },
            spawnInfo: {
                numberOfEnemiesToSpawn
            }
        };
    }

    getHardSpawnConditions () {
        let numberOfEnemiesToSpawn;
        let percentage = PhaserMath.RND.frac();

        if (percentage < 0.55) {
            numberOfEnemiesToSpawn = PhaserMath.RND.between(4, 6);
        } else if (percentage < 0.95) {
            numberOfEnemiesToSpawn = PhaserMath.RND.between(7, 10);
        } else {
            numberOfEnemiesToSpawn = PhaserMath.RND.between(1, 3);
        }


        return {
            triggerInfo: {
                spawnCooldown: PhaserMath.RND.between(1000, 2500),
            },
            spawnInfo: {
                numberOfEnemiesToSpawn
            }
        };
    }

    getSoulslikeSpawnConditions () {
        let numberOfEnemiesToSpawn;
        let percentage = PhaserMath.RND.frac();

        if (percentage < 0.6) {
            numberOfEnemiesToSpawn = PhaserMath.RND.between(7, 10);
        } else if (percentage < 0.95) {
            numberOfEnemiesToSpawn = PhaserMath.RND.between(4, 6);
        } else {
            numberOfEnemiesToSpawn = PhaserMath.RND.between(1, 3);
        }


        return {
            triggerInfo: {
                spawnCooldown: PhaserMath.RND.between(1000, 2500),
            },
            spawnInfo: {
                numberOfEnemiesToSpawn
            }
        };
    }
}

