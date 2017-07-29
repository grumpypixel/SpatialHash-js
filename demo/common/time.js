/* time.js */

class Time {
	constructor() {
		this.reset();
	}

	start() {
		if (this.running) {
			return;
		}
		const now = this.now();
		this.startTime = now;
		this.lastTime = now;
		this.running = true;
	}

	stop() {
		this.running = false;
	}

	update() {
		if (this.running === false) {
			return;
		}

		this.frameCount++;

		const now = this.now();
		this.totalElapsedTime = now - this.startTime;
		this.elapsedSinceLastFrame = now - this.lastTime;
		this.lastTime = now;

		this.unscaledDeltaTime = this.elapsedSinceLastFrame / 1000.0;
		this.deltaTime = this.unscaledDeltaTime * this.timeScale;
	}

	now() {
		return Date.now();
	}

	reset() {
		this.frameCount = 0;
		this.timeScale = 1.0;
		this.totalElapsedTime = 0;
		this.startTime = null;
		this.lastTime = null;
		this.elapsedSinceLastFrame = 0;
		this.deltaTime = 0.0;
		this.unscaledDeltaTime = 0.0;
		this.running = false;
	}
}
