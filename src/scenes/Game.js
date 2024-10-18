import { Scene } from 'phaser';
import { crossSceneEventEmitter, gameLogicEventEmitter } from '../utils';
import { SpawnSystem, CombatSystem, MovementSystem, VFXSystem, ScoreSystem } from '../systems';
import { LaserBeam, BasicEnemy, Explosion } from '../poolObjects';
import { CrossSceneEvent, GameLogicEvent, ScreenShakeType, ScoreUpdateType } from '../constants';

export class Game extends Scene
{
    _player;
    _enemyPool;
    _laserPool;
    _enemyLaserPool;

    _spawnSystem;
    _movementSystem;
    _combatSystem;
    _vfxSystem;
    _scoreSystem;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.subscribeToEvents();
        this.cameras.main.setBackgroundColor(0x000000);

        this._laserPool = this.physics.add.group({
            classType: LaserBeam,
            maxSize: 50,
            runChildUpdate: true
        });

        this._enemyLaserPool = this.physics.add.group({
            classType: LaserBeam,
            maxSize: 500,
            runChildUpdate: true
        });

        this._enemyPool = this.physics.add.group({
            classType: BasicEnemy,
            maxSize: 50,
            runChildUpdate: true,
        });

        this._explosionPool = this.add.group({
            classType: Explosion,
            maxSize: 50,
            runChildUpdate: true
        });

        this._scoreSystem = new ScoreSystem();
        this._spawnSystem = new SpawnSystem(this, this._enemyPool);
        this._player = this._spawnSystem.player;
        this._movementSystem = new MovementSystem(this, this._player);
        this._combatSystem = new CombatSystem(this, this._player, {
            enemyPool: this._enemyPool,
            explosionPool: this._explosionPool,
            laserBeamPool: this._laserPool,
            enemyLaserBeamPool: this._enemyLaserPool
        });

        this._vfxSystem = new VFXSystem(this, {
            explosionPool: this._explosionPool,
        });


        this._combatSystem.activateCollisions();
        this._combatSystem.startEnemyAI();
        this._spawnSystem.activateEnemySpawnTimer();
        this._movementSystem.activatePointerMovement();

        this.scene.launch('HUD');
    }

    subscribeToEvents () {
        gameLogicEventEmitter.on(GameLogicEvent.PLAYER_FIRE, this.onPlayerFire, this);
        gameLogicEventEmitter.on(GameLogicEvent.ENEMY_DEATH, this.onEnemyDeath, this);
        gameLogicEventEmitter.on(GameLogicEvent.PLAYER_DEATH, this.onPlayerDeath, this);
        gameLogicEventEmitter.on(GameLogicEvent.SHIP_DESTROYED, this.onShipDestroyed, this);
        gameLogicEventEmitter.on(GameLogicEvent.SCORE_UPDATED, this.onScoreUpdated, this);
    }

    onPlayerFire () {
        this._vfxSystem.shakeScreen(ScreenShakeType.PLAYER_FIRE);
    }

    onEnemyDeath () {
        this._vfxSystem.shakeScreen(ScreenShakeType.ENEMY_DEATH);
        this._scoreSystem.update(ScoreUpdateType.ENEMY_HIT);
    }

    onPlayerDeath(closestEnemy) {
        this._vfxSystem.shakeScreen(ScreenShakeType.PLAYER_DEATH);
        this._spawnSystem.spawnPlayer(closestEnemy ? { enemy: closestEnemy } : undefined);
    }

    onShipDestroyed (ship) {
        this._vfxSystem.makeShipExplosion(ship);
    }

    onScoreUpdated (score) {
        crossSceneEventEmitter.emit(CrossSceneEvent.UPDATE_SCORE, score);
    }

    update () {
        this._movementSystem.handlePlayerMovement();
        this._combatSystem.update();
    }
}
