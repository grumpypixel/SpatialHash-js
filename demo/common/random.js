/* random.js */

class Random {
	static randomMinMax(min, max) {
		return (Math.random() * (max - min)) + min;
	}

	static randomPointInCircle(minRadius, maxRadius) {
		const radius = this.randomMinMax(minRadius, maxRadius);
		const angle = Math.random() * Math.PI * 2;
		return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
	}
}
