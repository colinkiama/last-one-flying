import { Scene, Math as PhaserMath, Time } from 'phaser';
import {
    crossSceneEventEmitter,
    gameLogicEventEmitter
} from '../utils';

import { SpawnSystem, CombatSystem, MovementSystem } from '../systems';

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
    _spawnSystem;
    _movementSystem;
    _combatSystem;

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

        this._spawnSystem = new SpawnSystem(this, this._basicEnemies);
        this._player = this._spawnSystem.player;
        this._movementSystem = new MovementSystem(this, this._player);
        this._combatSystem = new CombatSystem(this, this._player, {
            enemyPool: this._basicEnemies,
            explosionPool: this._explosions,
            laserBeamPool: this._laserBeams,
            enemyLaserBeamPool: this._enemyLaserBeams
        });

        this._combatSystem.activateCollisions();
        gameLogicEventEmitter.on(GameLogicEvent.ENEMY_DEATH, this.onEnemyDeath, this);
        gameLogicEventEmitter.on(GameLogicEvent.PLAYER_DEATH, this.onPlayerDeath, this);

        this._combatSystem.startEnemyAI();

        this._enemySpawnTimerEvent = new Time.TimerEvent({
            delay: 500,
            startAt: 500,
            loop: true,
            callback: () => {
                this._spawnSystem.spawn()
            }
        })

        this._movementSystem.activatePointerMovement();

        this.time.addEvent(this._enemyShotTimerEvent);
        this.time.addEvent(this._enemySpawnTimerEvent);

        this.scene.launch('HUD');
    }

    onEnemyDeath () {
        this.cameras.main.shake(200, 0.01);
        this.updateScore(ScoreUpdateType.ENEMY_HIT);
    }

    onPlayerDeath(closestEnemy) {
        this.cameras.main.shake(500, 0.01);
        this._spawnSystem.spawnPlayer(closestEnemy ? { enemy: closestEnemy } : undefined);
    }

    update () {
        this._movementSystem.handlePlayerMovement();
        this._combatSystem.update();
    }

    updateScore (updateType) {
        switch (updateType) {
            case ScoreUpdateType.ENEMY_HIT:
                this._score += 100;
                break;
        }

        crossSceneEventEmitter.emit(CrossSceneEvent.UPDATE_SCORE, this._score);
    }
}
