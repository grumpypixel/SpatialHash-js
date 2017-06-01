/* spatialhash.js */

class SpatialHash {

  /**
   * @param {Number} cellSize - The cell size as the n-th power of two
   * @param {Boolean} deleteEmptyBuckets - Optional, delete buckets that don't contain objects any more
   */
  constructor(cellSize, deleteEmptyBuckets=true) {
    this.cellSize = Math.trunc(Math.max(0, cellSize));
    this.map = new Map();
    this.objects = [];
    this.tmpKeys = [];
    this.delimiter = ',';
    this.deleteEmptyBuckets = deleteEmptyBuckets;
  }

  insert(obj) {
    this.objects.push(obj);
    this.__insertObjectIntoMap(obj);
  }

  clear() {
    this.objects.length = 0;
    this.__clearMap();
  }

  findCandidates(rect, outCandidates) {
    this.tmpKeys.length = 0;
    this.__createKeys(rect, this.tmpKeys);
    for (let i = 0; i < this.tmpKeys.length; ++i) {
      const key = this.tmpKeys[i];
      let list = this.map.get(key);
      if (list !== undefined) {
        const count = list.length;
        for (let n = 0; n < count; ++n) {
          outCandidates.push(list[n]);
        }
      }
    }
  }

  rebuild() {
    this.__clearMap();
    const count = this.objects.length;
    for (let i = 0; i < count; ++i) {
      this.__insertObjectIntoMap(this.objects[i]);
    }
  }

  drawBuckets(context, color, canvasOriginOffset, canvasHeight) {
    let buckets = [];
    const delimiter = this.delimiter;
    this.map.forEach(function(value, key, map) {
      const values = key.split(delimiter);
      const x = parseInt(values[0]);
      const y = parseInt(values[1]);
      buckets.push({ x: x, y: y });
    });
    const size = Math.pow(2, this.cellSize);
    const extents = size * 0.5;
    for (let i = 0; i < buckets.length; ++i) {
      const x = buckets[i].x * size + extents + canvasOriginOffset.x;
      const y = canvasHeight - (buckets[i].y * size + extents + canvasOriginOffset.y);
      this.__drawRect(context, x - extents, y - extents, size, size, color);
    }
  }

  drawObjects(context, color, canvasOriginOffset, canvasHeight) {
    const count = this.objects.length;
    for (let i = 0; i < count; ++i) {
      const obj = this.objects[i];
      const x = obj.x + canvasOriginOffset.x;
      const y = canvasHeight - (obj.y + canvasOriginOffset.y);
      this.__drawRect(context, x - obj.width * 0.5, y - obj.height * 0.5, obj.width, obj.height, color);
    }
  }

  __drawRect(context, x, y, width, height, color) {
    context.strokeStyle = color;
    context.strokeRect(x, y, width, height);
  }

  __clearMap() {
    const deleteEmptyBuckets = this.deleteEmptyBuckets;
    this.map.forEach(function(value, key, map) {
      if (value.length > 0) {
        value.length = 0;
      } else if (deleteEmptyBuckets) {
        map.delete(key);
      }
    });
  }

  __insertObjectIntoMap(obj) {
    this.tmpKeys.length = 0;
    this.__createKeys(obj, this.tmpKeys);
    for (let i = 0; i < this.tmpKeys.length; ++i) {
      const key = this.tmpKeys[i];
      let list = this.map.get(key);
      if (list !== undefined) {
        list.push(obj);
      } else {
        this.map.set(key, [obj]);
      }
    }
  }

  __createKeys(obj, outKeys) {
    const halfWidth = obj.width * 0.5;
    const halfHeight = obj.height * 0.5;
    const x0 = Math.trunc(obj.x - halfWidth) >> this.cellSize;
    const x1 = Math.trunc(obj.x + halfWidth) >> this.cellSize;
    const y0 = Math.trunc(obj.y - halfHeight) >> this.cellSize;
    const y1 = Math.trunc(obj.y + halfHeight) >> this.cellSize;
    for (let yi = y0; yi <= y1; ++yi) {
      for (let xi = x0; xi <= x1; ++xi) {
        outKeys.push('' + xi + this.delimiter + yi);
      }
    }
  }
}
