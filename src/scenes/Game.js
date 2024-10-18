import { Scene, Math as PhaserMath, Time } from 'phaser';
import {

    SpawnManager,
    CombatManager,
    MovementManager,
    crossSceneEventEmitter,
    gameLogicEventEmitter
} from '../utils';

import { LaserBeam, BasicEnemy, Explosion } from '../poolObjects';
import { CrossSceneEvent, GameLogicEvent } from '../constants';

const ScoreUpdateType = {
    ENEMY_HIT: 'enemy-hit'
};

export class Game extends Scene
{

    _player;
    _basicEnemies;
    _laserBeams;
    _enemyLaserBeams;
    _nextShotTime;
    _explosions;
    _score;
    _enemySpawnTimerEvent;
    _spawnManager;
    _movementManager;
    _combatManager;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this._score = 0;

        this.cameras.main.setBackgroundColor(0x000000);

        this._laserBeams = this.physics.add.group({
            classType: LaserBeam,
            maxSize: 50,
            runChildUpdate: true
        });

        this._enemyLaserBeams = this.physics.add.group({
            classType: LaserBeam,
            maxSize: 500,
            runChildUpdate: true
        });

        this._basicEnemies = this.physics.add.group({
            classType: BasicEnemy,
            maxSize: 50,
            runChildUpdate: true,
        });

        this._explosions = this.add.group({
            classType: Explosion,
            maxSize: 50,
            runChildUpdate: true
        });

        this._spawnManager = new SpawnManager(this, this._basicEnemies);
        this._player = this._spawnManager.player;
        this._movementManager = new MovementManager(this, this._player);
        this._combatManager = new CombatManager(this, this._player, {
            enemyPool: this._basicEnemies,
            explosionPool: this._explosions,
            laserBeamPool: this._laserBeams,
            enemyLaserBeamPool: this._enemyLaserBeams
        });

        this._combatManager.activateCollisions();
        gameLogicEventEmitter.on(GameLogicEvent.ENEMY_DEATH, this.onEnemyDeath, this);
        gameLogicEventEmitter.on(GameLogicEvent.PLAYER_DEATH, this.onPlayerDeath, this);

        this._combatManager.startEnemyAI();

        this._enemySpawnTimerEvent = new Time.TimerEvent({
            delay: 500,
            startAt: 500,
            loop: true,
            callback: () => {
                this._spawnManager.spawn()
            }
        })

        this.time.addEvent(this._enemyShotTimerEvent);
        this.time.addEvent(this._enemySpawnTimerEvent);
        this.input.on('pointermove', this.onPointerMove.bind(this));

        this.scene.launch('HUD');
    }

    onEnemyDeath () {
        this.cameras.main.shake(200, 0.01);
        this.updateScore(ScoreUpdateType.ENEMY_HIT);
    }

    onPlayerDeath(closestEnemy) {
        this.cameras.main.shake(500, 0.01);
        this._spawnManager.spawnPlayer(closestEnemy ? { enemy: closestEnemy } : undefined);
    }

    update () {
        this._movementManager.handlePlayerMovement();
        this._combatManager.update();
    }

    updateScore (updateType) {
        switch (updateType) {
            case ScoreUpdateType.ENEMY_HIT:
                this._score += 100;
                break;
        }

        crossSceneEventEmitter.emit(CrossSceneEvent.UPDATE_SCORE, this._score);
    }

    onPointerMove(pointer) {
        const targetAngle = Phaser.Math.Angle.Between(this._player.x, this._player.y, pointer.worldX, pointer.worldY);
        const rotation = this._player.setRotation(targetAngle);
    }
}
