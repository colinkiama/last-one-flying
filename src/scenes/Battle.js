import { Scene } from 'phaser';
import {
  crossSceneEventEmitter,
  gameLogicEventEmitter,
} from '../utils/events.js';

import { SpawnSystem } from '../systems/spawnSystem.js';
import { CombatSystem } from '../systems/combatSystem.js';
import { MovementSystem } from '../systems/movementSystem.js';
import { VFXSystem } from '../systems/vfxSystem.js';
import { ScoreSystem } from '../systems/scoreSystem.js';
import { StatusSystem } from '../systems/statusSystem.js';

import { LaserBeam } from '../poolObjects/LaserBeam.js';
import { BasicEnemy } from '../poolObjects/BasicEnemy.js';
import { Explosion } from '../poolObjects/Explosion.js';

import { CrossSceneEvent, GameLogicEvent } from '../constants/events.js';
import { ScreenShakeType } from '../constants/vfx.js';
import { ScoreUpdateType } from '../constants/score.js';
import { Player } from '../gameObjects/Player.js';

export class Battle extends Scene {
  _player;
  _enemyPool;
  _laserPool;
  _enemyLaserPool;
  _explosionPool;

  _spawnSystem;
  _movementSystem;
  _combatSystem;
  _vfxSystem;
  _scoreSystem;
  _statusSystem;

  constructor() {
    super('Game');
  }

  create() {
    this.subscribeToEvents();
    this.cameras.main.setBackgroundColor(0x000000);

    this._laserPool = this.physics.add.group({
      classType: LaserBeam,
      maxSize: 50,
      runChildUpdate: true,
    });

    this._enemyLaserPool = this.physics.add.group({
      classType: LaserBeam,
      maxSize: 500,
      runChildUpdate: true,
    });

    this._enemyPool = this.physics.add.group({
      classType: BasicEnemy,
      maxSize: 50,
      runChildUpdate: true,
    });

    this._explosionPool = this.add.group({
      classType: Explosion,
      maxSize: 50,
      runChildUpdate: true,
    });

    this._scoreSystem = new ScoreSystem();
    this._player = new Player(this);
    console.log('Player:', this._player);
    this._spawnSystem = new SpawnSystem(this, this._player, this._enemyPool);
    this._movementSystem = new MovementSystem(this, this._player);
    this._combatSystem = new CombatSystem(this, this._player, {
      enemyPool: this._enemyPool,
      explosionPool: this._explosionPool,
      laserBeamPool: this._laserPool,
      enemyLaserBeamPool: this._enemyLaserPool,
    });

    this._vfxSystem = new VFXSystem(this, {
      explosionPool: this._explosionPool,
    });

    this._statusSystem = new StatusSystem();

    this._combatSystem.activateCollisions();
    this._combatSystem.startEnemyAI();
    this._spawnSystem.activateEnemySpawnTimer();
    this._movementSystem.activatePointerMovement();

    this.scene.launch('HUD', {
      lives: this._statusSystem.getLives(),
    });
  }

  subscribeToEvents() {
    gameLogicEventEmitter.on(
      GameLogicEvent.PLAYER_FIRE,
      this.onPlayerFire,
      this,
    );
    gameLogicEventEmitter.on(
      GameLogicEvent.ENEMY_DEATH,
      this.onEnemyDeath,
      this,
    );
    gameLogicEventEmitter.on(
      GameLogicEvent.PLAYER_DEATH,
      this.onPlayerDeath,
      this,
    );
    gameLogicEventEmitter.on(
      GameLogicEvent.SHIP_DESTROYED,
      this.onShipDestroyed,
      this,
    );
    gameLogicEventEmitter.on(
      GameLogicEvent.SCORE_UPDATED,
      this.onScoreUpdated,
      this,
    );
    gameLogicEventEmitter.on(
      GameLogicEvent.LIVES_UPDATED,
      this.onLivesUpdated,
      this,
    );
    gameLogicEventEmitter.on(GameLogicEvent.GAME_OVER, this.onGameOver, this);
  }

  onPlayerFire() {
    this._vfxSystem.shakeScreen(ScreenShakeType.PLAYER_FIRE);
  }

  onEnemyDeath() {
    this._vfxSystem.shakeScreen(ScreenShakeType.ENEMY_DEATH);
    this._scoreSystem.update(ScoreUpdateType.ENEMY_HIT);
    this._spawnSystem.updateLastEnemyHitTime(this.time.now);
  }

  onPlayerDeath(closestEnemy) {
    this._vfxSystem.shakeScreen(ScreenShakeType.PLAYER_DEATH);
    this._statusSystem.loseLife();
    if (this._statusSystem.getLives() < 1) {
      return;
    }

    this.time.delayedCall(2000, () => {
      this._spawnSystem.spawnPlayer(
        closestEnemy ? { enemy: closestEnemy } : undefined,
      );
    });
  }

  onShipDestroyed(ship) {
    this._vfxSystem.makeShipExplosion(ship);
  }

  onScoreUpdated(score) {
    crossSceneEventEmitter.emit(CrossSceneEvent.UPDATE_SCORE, score);
  }

  onLivesUpdated(lives) {
    crossSceneEventEmitter.emit(CrossSceneEvent.UPDATE_LIVES, lives);
  }

  onGameOver() {
    this._spawnSystem.deactivateEnemySpawnTimer();
    this.reset();
  }

  update() {
    this._movementSystem.handlePlayerMovement();
    this._combatSystem.update();
  }

  reset() {
    this.clearPools();

    this.time.delayedCall(500, () => {
      this._statusSystem.reset();
      this._scoreSystem.reset();
      this._spawnSystem.reset();
    });
  }

  clearPools() {
    const pools = [
      this._enemyPool,
      this._explosionPool,
      this._laserPool,
      this._enemyLaserPool,
    ];

    for (const pool of pools) {
      const activeElements = pool.getMatching('active', true);
      for (let i = activeElements.length - 1; i > -1; i--) {
        const element = activeElements[i];
        pool.killAndHide(element);
      }
    }
  }
}
