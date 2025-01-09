import { Scene, Data } from 'phaser';
import {
  crossSceneEventEmitter,
  gameLogicEventEmitter,
} from '../utils/events.js';
import { tour } from '../utils/pool.js';

import { SpawnSystem } from '../systems/spawnSystem.js';
import { CombatSystem } from '../systems/combatSystem.js';
import { MovementSystem } from '../systems/movementSystem.js';
import { VFXSystem } from '../systems/vfxSystem.js';
import { ScoreSystem } from '../systems/scoreSystem.js';
import { StatusSystem } from '../systems/statusSystem.js';

import { LaserBeam } from '../poolObjects/LaserBeam.js';
import { PlayerLaserBeam } from '../poolObjects/PlayerLaserBeam.js';
import { BasicEnemy } from '../poolObjects/BasicEnemy.js';
import { Explosion } from '../poolObjects/Explosion.js';

import { CrossSceneEvent, GameLogicEvent } from '../constants/events.js';
import { ScreenShakeType } from '../constants/vfx.js';
import { ScoreUpdateType } from '../constants/score.js';
import { Player } from '../gameObjects/Player.js';
import { PLAYER_STARTING_POSITION } from '../constants/spawn.js';
import { STARTING_LIVES } from '../constants/status.js';
import { TOUCH_CONTROLS_KEY } from '../constants/data.js';
import { TouchControlsSystem } from '../systems/touchControlsSystem.js';

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
  _touchControlsSystem;

  constructor() {
    super('Battle');
  }

  create() {
    this.subscribeToEvents();
    this.cameras.main.setBackgroundColor(0x000000);

    const joystick = this.plugins.get('rexVirtualJoystick').add(this, {
      x: 150,
      y: 270,
      radius: 50,
      base: this.add.arc(0, 0, 60).setStrokeStyle(2, 0xffffff),
      thumb: this.add.arc(0, 0, 40).setStrokeStyle(2, 0xffffff),
      enable: false,
    });

    const isTouchControlsEnabled = this.registry.get(TOUCH_CONTROLS_KEY);
    const fireButton = this.add
      .circle(490, 270, 50)
      .setStrokeStyle(2, 0xffffff);

    const touchButtons = {
      fire: fireButton,
    };

    this._touchControlsSystem = new TouchControlsSystem(joystick, touchButtons);
    this._touchControlsSystem.visible = isTouchControlsEnabled;

    this._laserPool = this.physics.add.group({
      classType: PlayerLaserBeam,
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
    this._player = new Player(
      this,
      PLAYER_STARTING_POSITION.x,
      PLAYER_STARTING_POSITION.y,
      'player',
    );
    this._spawnSystem = new SpawnSystem(this, this._player, this._enemyPool);
    this._movementSystem = new MovementSystem(
      this,
      this._player,
      this._touchControlsSystem,
    );

    this._combatSystem = new CombatSystem(
      this,
      this._player,
      {
        enemyPool: this._enemyPool,
        laserBeamPool: this._laserPool,
        enemyLaserBeamPool: this._enemyLaserPool,
      },
      this._touchControlsSystem,
    );

    this._vfxSystem = new VFXSystem(this, {
      explosionPool: this._explosionPool,
    });

    this._statusSystem = new StatusSystem(STARTING_LIVES);

    this._combatSystem.activateCollisions();
    this._combatSystem.startEnemyAI();
    this._spawnSystem.activateEnemySpawnTimer();
    if (isTouchControlsEnabled) {
      this._movementSystem.activateJoystickMovement();
    } else {
      this._movementSystem.activatePointerMovement();
    }

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

    crossSceneEventEmitter.on(
      CrossSceneEvent.SHAKE_SCREEN,
      this.onScreenShakeRequested,
      this,
    );

    crossSceneEventEmitter.on(
      CrossSceneEvent.PAUSE_GAME,
      this.onPauseGame,
      this,
    );

    crossSceneEventEmitter.on(
      CrossSceneEvent.RESUME_GAME,
      this.onResumeGame,
      this,
    );

    crossSceneEventEmitter.on(CrossSceneEvent.QUIT_GAME, this.onQuitGame, this);

    this.registry.events.on(Data.Events.CHANGE_DATA, (parent, key, value) => {
      this.onDataChanged(parent, key, value);
    });

    this.registry.events.on(Data.Events.SET_DATA, (parent, key, value) => {
      this.onDataChanged(parent, key, value);
    });
  }

  onQuitGame() {
    // TODO:
    // - Tell HUD to unsubscribe from all events and send HUD_DESTROYED message back
    // - On HUD_DESTROYED message, unsubscribe from all events in this scene
    // - Start main menu scene, destroying this scene
    console.log('Quit game!');
  }

  onResumeGame() {
    this.scene.resume(this);
  }

  onPauseGame() {
    this.scene.pause(this);
  }

  onDataChanged(_parent, key, value) {
    switch (key) {
      case TOUCH_CONTROLS_KEY:
        if (value) {
          this._movementSystem.activateJoystickMovement();
        } else {
          this._movementSystem.activatePointerMovement();
        }

        this._touchControlsSystem.visible = value;
        break;
      default:
        break;
    }
  }

  onScreenShakeRequested(screenShakeType) {
    this._vfxSystem.shakeScreen(screenShakeType);
  }

  onPlayerFire() {
    crossSceneEventEmitter.emit(
      CrossSceneEvent.SHAKE_SCREEN,
      ScreenShakeType.PLAYER_FIRE,
    );
  }

  onEnemyDeath() {
    crossSceneEventEmitter.emit(
      CrossSceneEvent.SHAKE_SCREEN,
      ScreenShakeType.ENEMY_DEATH,
    );
    this._scoreSystem.update(ScoreUpdateType.ENEMY_HIT);
    this._spawnSystem.updateLastEnemyHitTime(this.time.now);
  }

  onPlayerDeath(closestEnemy) {
    crossSceneEventEmitter.emit(
      CrossSceneEvent.SHAKE_SCREEN,
      ScreenShakeType.PLAYER_DEATH,
    );
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
    this._combatSystem.update(this._movementSystem.movementType);
  }

  reset() {
    this.clearPhysicsPools();

    this.time.delayedCall(1000, () => {
      this.clearVFXPools();
      this._statusSystem.reset();
      this._scoreSystem.reset();
      this._spawnSystem.reset();
    });
  }

  clearPhysicsPools() {
    tour(
      [this._enemyPool, this._laserPool, this._enemyLaserPool],
      (member) => member.disableBody(true, true),
      {
        property: 'active',
        value: true,
      },
    );
  }

  clearVFXPools() {
    tour(
      [this._explosionPool],
      (member) => member.setActive(false).setVisible(false),
      {
        property: 'active',
        value: true,
      },
    );
  }
}
