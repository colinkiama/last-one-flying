import { Math as PhaserMath, Time } from 'phaser';
import { ENEMY_SPAWN_COOLDOWN, ENEMY_HEIGHT, WaveDifficulty } from '../constants';

export class SpawnSystem {
    scene;
    // TODO: Figure out a better way to create a player so you don't have to
    // make the player field public here.
    player;
    _enemyGroup;
    _last_enemy_hit_time;
    _enemySpawnTimerEvent;
    _enemySpawnCondition;
    _currentEnemyWave;

    constructor (scene, enemyGroup) {
        this.scene = scene;
        this.player = this.spawnPlayer();
        this._enemyGroup = enemyGroup;
        this._last_enemy_hit_time = 0;
        this._currentEnemyWave = 0;
        this._enemySpawnCondition = {
            triggerInfo: {
                spawnCooldown: 2500,
            },
            spawnInfo: {
                numberOfEnemiesToSpawn: PhaserMath.RND.between(1, 3)
            }
        };

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

    spawnEnemies () {
        const { triggerInfo, spawnInfo } = this._enemySpawnCondition;
        const activeEnemies = this._enemyGroup.getMatching('active', true);
        if (activeEnemies.length > 0 || (this.scene.time.now - this._last_enemy_hit_time) < triggerInfo.spawnCooldown) {
            return;
        }

        this._currentEnemyWave++;

        console.log('Current enemy wave:', this._currentEnemyWave);

        const minDistanceToPlayer = 200;
        // 50% of being left of player or right of player.
        const xPosition1 = PhaserMath.RND.between(0, this.player.x - minDistanceToPlayer);
        const xPosition2 = PhaserMath.RND.between(this.player.x + minDistanceToPlayer, this.scene.cameras.main.width);


        let enemyX = PhaserMath.RND.frac() >= 0.5 ? xPosition2 : xPosition1;
        let enemyY = Phaser.Math.RND.between(ENEMY_HEIGHT, this.scene.cameras.main.height - ENEMY_HEIGHT);

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

    updateLastEnemyHitTime (time) {
        this._last_enemy_hit_time = time;
    }

    prepareNextSpawnCondition () {
        const difficulty = getDifficulty(this._currentEnemyWave + 1);

        switch (difficulty) {
            case WaveDifficulty.EASY:
                return {
                    triggerInfo: {
                        spawnCooldown: PhaserMath.RND.between(1000, 2500),
                    },
                    spawnInfo: {
                        numberOfEnemiesToSpawn: PhaserMath.RND.between(1, 3)
                    }
                };
            case WaveDifficulty.MEDIUM:
                return {
                    triggerInfo: {
                        spawnCooldown: PhaserMath.RND.between(1000, 2500),
                    },
                    spawnInfo: {
                        numberOfEnemiesToSpawn: PhaserMath.RND.between(4, 6)
                    }
                };
            default:
                 return {
                    triggerInfo: {
                        spawnCooldown: PhaserMath.RND.between(1000, 2500),
                    },
                    spawnInfo: {
                        numberOfEnemiesToSpawn: PhaserMath.RND.between(1, 3)
                    }
                };
                // throw new Error(`Unknown wave difficulty: ${difficulty}`);
        }

        return {
            triggerInfo: {
                spawnCooldown: PhaserMath.RND.between(1000, 2500),
            },
            spawnInfo: {
                numberOfEnemiesToSpawn: PhaserMath.RND.between(1, 3)
            }
        };
    }
}

function getDifficulty (nextWave) {
    if (nextWave < 3) {
        return WaveDifficulty.EASY;
    } else if (nextWave < 7) {
        return WaveDifficulty.MEDIUM;
    } else if (nextWave < 13) {
        return WaveDifficulty.HARD;
    } else {
        return WaveDifficulty.SOULS_LIKE;
    }
}
