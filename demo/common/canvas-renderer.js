/* canvas-renderer.js */

class CanvasRenderer {

  static drawCircle(context, x, y, radius, color, fill) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    if (fill === true) {
      context.fillStyle = color;
      context.fill();
    } else {
      context.strokeStyle = color;
      context.stroke();
    }
  }

  static drawRect(context, x, y, width, height, color, fill) {
    if (fill === true) {
      context.fillStyle = color;
      context.fillRect(x, y, width, height);
    } else {
      context.strokeStyle = color;
      context.strokeRect(x, y, width, height);
    }
  }

  static drawText(context, x, y, text, color, align, font) {
    context.font = font || "16px Verdana";
    context.fillStyle = color || "#888";
    context.textAlign = align || "center";
    context.fillText(text, x, y);
  }
}
