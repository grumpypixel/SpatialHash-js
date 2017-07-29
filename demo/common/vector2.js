/* vector2.js */

class Vector2 {
	static scaled(v, s) {
		return { x: v.x * s, y: v.y * s };
	}

	static normalized(v) {
		const mag = Vector2.magnitude(v);
		return (mag !== 0.0 ? { x: v.x / mag, y: v.y / mag } : vec);
	}

	static magnitude(v) {
		return Math.sqrt(v.x ** 2 + v.y ** 2);
	}

	static sqrMagnitude(v) {
		return (v.x ** 2 + v.y ** 2);
	}
}
