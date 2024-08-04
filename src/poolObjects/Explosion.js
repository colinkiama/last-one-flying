import { GameObjects } from 'phaser';
export default class Explosion extends GameObjects.Particles.ParticleEmitter {
    timeSinceExplosion;

    constructor (config) {
        super(config);
    }

    enable () {
        this.setActive(true);
        this.setVisible(true);
        return this;
    }

    explode (count, x, y) {
        super.explode(count, x, y);
        this.timeSinceExplosion = this.scene.time.now;
        return this;
    }

    update (time, delta) {
        if (time - this.timeSinceExplosion >= this.lifespan && this.getAliveParticleCount() === 0) {
            this.setActive(false);
            this.setVisible(false);
            this.timeSinceExplosion = 0;
        }
    }
}
