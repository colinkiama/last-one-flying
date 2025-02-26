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
import { LocalStorageKey, RegistryKey } from '../constants/data.js';
import { TouchControlsSystem } from '../systems/touchControlsSystem.js';
import { SceneKey } from '../constants/scene.js';
import { Stopwatch } from '../utils/stopwatch.js';
import {
  JOYSTICK_BASE_RADIUS,
  JOYSTICK_OFFSET_X,
  JOYSTICK_OFFSET_Y,
  JOYSTICK_RADIUS,
  JOYSTICK_THUMB_RADIUS,
} from '../constants/touch.js';
import { DependencyKey } from '../constants/injector.js';
import { AudioKey, AudioMarkerKey, LOOP_MARKER_CONFIGS } from '../constants/audio.js';

export class Battle extends Scene {
  injector;

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
  _audioSystem;

  _sessionStopWatch;
  _playerGracePeriodTween;

  constructor() {
    super(SceneKey.BATTLE);
  }

  setupDependencies() {
    this._audioSystem = this.injector.get(DependencyKey.AUDIO_SYSTEM);
  }

  create() {
    if(
      !this._audioSystem.get(AudioKey.BATTLE_THEME)?.isPlaying
      ) {
        this._audioSystem.playLoop(AudioKey.BATTLE_THEME, { loop: false }, LOOP_MARKER_CONFIGS[AudioKey.BATTLE_THEME]);
    }

    this.subscribeToEvents();
    this.cameras.main.setBackgroundColor(0x000000);

    const isTouchControlsEnabled = this.registry.get(
      RegistryKey.TOUCH_CONTROLS,
    );

    const leftJoystick = this.plugins.get('rexVirtualJoystick').add(this, {
      x: JOYSTICK_OFFSET_X,
      y: this.cameras.main.height - JOYSTICK_OFFSET_Y,
      radius: JOYSTICK_RADIUS,
      base: this.add
        .arc(0, 0, JOYSTICK_BASE_RADIUS)
        .setStrokeStyle(2, 0xffffff),
      thumb: this.add
        .arc(0, 0, JOYSTICK_THUMB_RADIUS)
        .setStrokeStyle(2, 0xffffff),
      dir: 'up&down',
    });

    const rightJoystick = this.plugins.get('rexVirtualJoystick').add(this, {
      x: this.cameras.main.width - JOYSTICK_OFFSET_X,
      y: this.cameras.main.height - JOYSTICK_OFFSET_Y,
      radius: JOYSTICK_RADIUS,
      base: this.add
        .arc(0, 0, JOYSTICK_BASE_RADIUS)
        .setStrokeStyle(2, 0xffffff),
      thumb: this.add
        .arc(0, 0, JOYSTICK_THUMB_RADIUS)
        .setStrokeStyle(2, 0xffffff),
      enable: false,
    });

    this._touchControlsSystem = new TouchControlsSystem(
      leftJoystick,
      rightJoystick,
    );
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

    this._sessionStopWatch = new Stopwatch(this);
  }

  subscribeToEvents() {
    this.input.keyboard.on('keyup-P', this.onPauseRequested, this);

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

    gameLogicEventEmitter.on(
      GameLogicEvent.GRACE_PERIOD_STARTED,
      this.onGracePeriodStarted,
      this,
    );

    gameLogicEventEmitter.on(
      GameLogicEvent.GRACE_PERIOD_ENDED,
      this.onGracePeriodEnded,
      this,
    );

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

    crossSceneEventEmitter.on(
      CrossSceneEvent.HUD_DESTROYED,
      this.onHudDestroyed,
      this,
    );

    crossSceneEventEmitter.on(
      CrossSceneEvent.RESET_GAME,
      this.onResetGame,
      this,
    );

    this.registry.events.on(Data.Events.CHANGE_DATA, this.onDataChanged, this);
    this.registry.events.on(Data.Events.SET_DATA, this.onDataChanged, this);

    this.events.once('shutdown', this.unsubscribeFromEvents, this);
  }
  onResetGame() {
    this.scene.resume();
    this.scene.resume(SceneKey.HUD);
    this.reset();
  }

  onPauseRequested() {

    this.scene.launch(SceneKey.PAUSE_MENU);
  }

  unsubscribeFromEvents() {
    this.input.keyboard.off('keyup-P', this.onPauseRequested, this);

    gameLogicEventEmitter.off(
      GameLogicEvent.PLAYER_FIRE,
      this.onPlayerFire,
      this,
    );
    gameLogicEventEmitter.off(
      GameLogicEvent.ENEMY_DEATH,
      this.onEnemyDeath,
      this,
    );
    gameLogicEventEmitter.off(
      GameLogicEvent.PLAYER_DEATH,
      this.onPlayerDeath,
      this,
    );
    gameLogicEventEmitter.off(
      GameLogicEvent.SHIP_DESTROYED,
      this.onShipDestroyed,
      this,
    );
    gameLogicEventEmitter.off(
      GameLogicEvent.SCORE_UPDATED,
      this.onScoreUpdated,
      this,
    );
    gameLogicEventEmitter.off(
      GameLogicEvent.LIVES_UPDATED,
      this.onLivesUpdated,
      this,
    );

    gameLogicEventEmitter.off(GameLogicEvent.GAME_OVER, this.onGameOver, this);

    gameLogicEventEmitter.off(
      GameLogicEvent.GRACE_PERIOD_STARTED,
      this.onGracePeriodStarted,
      this,
    );

    gameLogicEventEmitter.off(
      GameLogicEvent.GRACE_PERIOD_ENDED,
      this.onGracePeriodEnded,
      this,
    );

    crossSceneEventEmitter.off(
      CrossSceneEvent.SHAKE_SCREEN,
      this.onScreenShakeRequested,
      this,
    );

    crossSceneEventEmitter.off(
      CrossSceneEvent.PAUSE_GAME,
      this.onPauseGame,
      this,
    );

    crossSceneEventEmitter.off(
      CrossSceneEvent.RESUME_GAME,
      this.onResumeGame,
      this,
    );

    crossSceneEventEmitter.off(
      CrossSceneEvent.QUIT_GAME,
      this.onQuitGame,
      this,
    );

    crossSceneEventEmitter.off(
      CrossSceneEvent.HUD_DESTROYED,
      this.onHudDestroyed,
      this,
    );

    crossSceneEventEmitter.off(
      CrossSceneEvent.RESET_GAME,
      this.onResetGame,
      this,
    );

    this.registry.events.off(Data.Events.CHANGE_DATA, this.onDataChanged, this);
    this.registry.events.off(Data.Events.SET_DATA, this.onDataChanged, this);
  }

  onGracePeriodEnded() {
    if (this._playerGracePeriodTween) {
      this._playerGracePeriodTween.stop();
    }

    this._player.alpha = 1;
  }

  onGracePeriodStarted() {
    this._playerGracePeriodTween = this._vfxSystem.createPlayerGracePeriodTween(
      this._player,
    );
  }

  onHudDestroyed() {
    this.scene.start(SceneKey.MAIN_MENU, { playMusic: true });
  }

  onQuitGame() {
    this._audioSystem.stop(AudioKey.BATTLE_THEME);
    this.scene.stop(SceneKey.HUD);
  }

  onResumeGame() {
    this._audioSystem.resume(AudioKey.BATTLE_THEME);
    this.scene.resume(SceneKey.HUD);
    this.scene.resume(this);
  }

  onPauseGame() {
    this.scene.pause(SceneKey.HUD);
    this.scene.pause(this);
    this._audioSystem.pause(AudioKey.BATTLE_THEME);
  }

  onDataChanged(_parent, key, value) {
    switch (key) {
      case RegistryKey.TOUCH_CONTROLS:
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

      this._combatSystem.startPlayerGracePeriod();
    });
  }

  onShipDestroyed(ship) {
    this._vfxSystem.createShipExplosion(ship);
  }

  onScoreUpdated(score) {
    crossSceneEventEmitter.emit(CrossSceneEvent.UPDATE_SCORE, score);
  }

  onLivesUpdated(lives) {
    crossSceneEventEmitter.emit(CrossSceneEvent.UPDATE_LIVES, lives);
  }

  onGameOver() {
    this._sessionStopWatch.pause();
    const gameStats = {
      score: this._scoreSystem.getScore(),
      oldHighScore: this.game.registry.get(RegistryKey.HIGH_SCORE),
      time: this._sessionStopWatch.formattedElapsedTime,
    };

    this.clearPhysicsPools();
    this.updateHighScore();
    this._spawnSystem.deactivateEnemySpawnTimer();

    this.time.delayedCall(1000, () => {
      this.scene.launch(SceneKey.GAME_OVER, gameStats);
    });
  }

  updateHighScore() {
    const storedHighScore = this.game.registry.get(RegistryKey.HIGH_SCORE);
    const score = this._scoreSystem.getScore();

    if (score > storedHighScore) {
      this.game.registry.set(RegistryKey.HIGH_SCORE, score);
      localStorage.setItem(LocalStorageKey.HIGH_SCORE, score);
    }
  }

  update() {
    this._movementSystem.handlePlayerMovement();
    this._combatSystem.update(this._movementSystem.movementType);
  }

  reset() {
    this.clearVFXPools();
    this._statusSystem.reset();
    this._scoreSystem.reset();
    this._spawnSystem.reset();
    crossSceneEventEmitter.emit(CrossSceneEvent.SCORE_RESET);
    this._sessionStopWatch.reset();
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
