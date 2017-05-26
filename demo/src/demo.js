/* demo.js */

const timer = new Time();
const textMargin = { top: 20, left: 10, bottom: 20, right: 10 };
const font = 'bold 16px Courier';

const options = {
  numObjects: 512,
  minRadius: 5,
  maxRadius: 10,
  minSpeed: 20,
  maxSpeed: 40,
  freezeMovement: false,
  cellSize: 5,
  deleteEmptyBuckets: true,
  testRectEnabled: true,
  testRectWidth: 64,
  testRectHeight: 64,
  bruteForceCollisionDetection: false,
  collisionDetectionEnabled: true,
  drawBuckets: true,
  drawObjects: true,
  highlightCollisions: true,
  displayInfo: true,
  lineWidth: 1,
  backgroundColor: '#80c080',
  bucketsColor: '#666666',
  objectColor: '#ffffff',
  testRectColor: '#ff0000',
  collisionColor: '#00ff00',
  infoColor: '#ff00ff',
  recreate: function() {
    objects = createObjects(options.numObjects);
  }
}

let grid = null;
let objects = [];
let testRect = { x: 0, y: 0, width: 64, height: 64 };
let canvasOriginOffset = {};
let nextId = 0;
let gridDirty = false;

window.onload = function() {
  const canvas = getCanvas();
  canvas.addEventListener("mousedown", onMouseDown, false);
  setCanvasBackgroundColor(options.backgroundColor);

  createGui();

  canvasOriginOffset = { x: canvas.width / 2, y: canvas.height / 2 };
  grid = createSpatialHash();
  objects = createObjects(options.numObjects);

  window.requestAnimationFrame(updateFrame);
}

window.onfocus = function() {
  if (timer) {
    timer.start();
  }
};

window.onblur = function() {
  if (timer) {
    timer.stop();
  }
}

function onMouseDown(event) {
  if (options.testRectEnabled) {
    const canvas = getCanvas();

    let x = event.x;
    let y = event.y;
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    x -= canvasOriginOffset.x;
    y -= canvasOriginOffset.y;
    y *= -1;

    testRect.x = x;
    testRect.y = y;
  }
}

function updateFrame() {
  const canvas = getCanvas();
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineWidth = options.lineWidth;

  timer.update();

  rebuildSpatialHash();

  if (options.drawBuckets) {
    grid.drawBuckets(context, options.bucketsColor, canvasOriginOffset, canvas.height);
  }

  let collisionDetectionResults = { candidates: 0, collisions: 0 };
  if (options.collisionDetectionEnabled) {
    if (options.bruteForceCollisionDetection === false) {
      collisionDetectionResults = detectCollisions(canvas, context, objects);
    } else {
      collisionDetectionResults = detectCollisionsBruteForce(canvas, context, objects);
    }
  }

  if (options.drawObjects) {
    drawObjects(canvas, context, objects, options.objectColor, false);
  }

  if (options.testRectEnabled) {
    const pos = convertCartesianToCanvasCoordinates(canvas, testRect.x, testRect.y);
    CanvasRenderer.drawRect(context, pos.x - testRect.width * 0.5, pos.y - testRect.height * 0.5, testRect.width, testRect.height, options.testRectColor, false);

    const candidates = [];
    grid.findCandidates(testRect, candidates);
    drawObjects(canvas, context, candidates, options.testRectColor, false);

    if (options.displayInfo) {
      CanvasRenderer.drawText(context, textMargin.left, textMargin.top, 'candidates: ' + candidates.length.toString(), options.testRectColor, 'left', font);
    }
  }

  if (options.displayInfo) {
    CanvasRenderer.drawText(context, canvas.width-textMargin.right, textMargin.top, (timer.deltaTime * 1000).toFixed(2), options.infoColor, 'right', font);
    CanvasRenderer.drawText(context, textMargin.left, canvas.height-textMargin.bottom, 'retrieved candidates: ' + collisionDetectionResults.candidates.toString(), options.infoColor, 'left', font);
    CanvasRenderer.drawText(context, canvas.width-textMargin.right, canvas.height-textMargin.bottom, 'detected collisions: ' + collisionDetectionResults.collisions.toString(), options.infoColor, 'right', font);
  }

  const bounds = {
    left: -canvas.width * 0.5,
    right: canvas.width * 0.5,
    top: canvas.height * 0.5,
    bottom: -canvas.height * 0.5
  };

  if (options.freezeMovement === false) {
    updateObjectPositions(objects, timer.deltaTime, bounds);
  }

  window.requestAnimationFrame(updateFrame);
}

function createGui() {
  const gui = new dat.gui.GUI();

  const spatialHashFolder = gui.addFolder('SpatialHash');
  const cellSizeController = spatialHashFolder.add(options, 'cellSize', 2, 9, 1);
  const deleteEmptyBucketsController = spatialHashFolder.add(options, 'deleteEmptyBuckets');

  const objectsFolder = gui.addFolder('Objects');
  const numObjectsController = objectsFolder.add(options, 'numObjects', 1, 4096, 1);
  const minRadiusController = objectsFolder.add(options, 'minRadius', 1, 40, 1).listen();
  const maxRadiusController = objectsFolder.add(options, 'maxRadius', 1, 40, 1).listen();
  const minSpeedController = objectsFolder.add(options, 'minSpeed', 10, 100, 1).listen();
  const maxSpeedController = objectsFolder.add(options, 'maxSpeed', 10, 100, 1).listen();
  objectsFolder.add(options, 'freezeMovement');

  const retrievalFolder = gui.addFolder('Candidates Retrieval');
  retrievalFolder.add(options, 'testRectEnabled');
  const testRectWidthController = retrievalFolder.add(options, 'testRectWidth', 8, 256, 1);
  const testRectHeightController = retrievalFolder.add(options, 'testRectHeight', 8, 256, 1);

  const collisionsFolder = gui.addFolder('Collision Detection');
  collisionsFolder.add(options, 'collisionDetectionEnabled');
  collisionsFolder.add(options, 'bruteForceCollisionDetection');

  const rendererFolder = gui.addFolder('Rendering');
  rendererFolder.add(options, 'drawBuckets');
  rendererFolder.add(options, 'drawObjects');
  rendererFolder.add(options, 'highlightCollisions');
  rendererFolder.add(options, 'displayInfo');
  rendererFolder.add(options, 'lineWidth', 1, 10, 1);

  const colorsFolder = gui.addFolder('Colors');
  const backgroundColorController = colorsFolder.addColor(options, 'backgroundColor');
  colorsFolder.addColor(options, 'bucketsColor');
  colorsFolder.addColor(options, 'objectColor');
  colorsFolder.addColor(options, 'testRectColor');
  colorsFolder.addColor(options, 'collisionColor');
  colorsFolder.addColor(options, 'infoColor');

  gui.add(options, 'recreate');

  numObjectsController.onChange(function(value) {
    if (value === objects.length) {
      return;
    }
    if (value > objects.length) {
      while (objects.length < value) {
        objects.push(createRandomObject(options.objectColor));
      }
    } else {
      while (objects.length > value) {
        objects.pop();
      }
    }
  });
  minRadiusController.onChange(function(value) {
    setObjectsMinRadius(value);
    if (value > options.maxRadius) {
      options.maxRadius = value;
    }
  });
  maxRadiusController.onChange(function(value) {
    setObjectsMaxRadius(value);
    if (value < options.minRadius) {
      options.minRadius = value;
    }
  });
  minSpeedController.onChange(function(value) {
    setObjectsMinSpeed(value);
    if (value > options.maxSpeed) {
      options.maxSpeed = value;
    }
  });
  maxSpeedController.onChange(function(value) {
    setObjectsMaxSpeed(value);
    if (value < options.minSpeed) {
      options.minSpeed = value;
    }
  });
  cellSizeController.onChange(function(value) {
    gridDirty = true;
  });
  deleteEmptyBucketsController.onChange(function(value) {
    gridDirty = true;
  });
  testRectWidthController.onChange(function(value) {
    testRect.width = value;
  });
  testRectHeightController.onChange(function(value) {
    testRect.height = value;
  });
  backgroundColorController.onChange(function(value) {
    setCanvasBackgroundColor(value);
  });
}

function createObjects(objectCount) {
  const objs = [];
  for (let i = 0; i < objectCount; ++i) {
    objs.push(createRandomObject(options.objectColor));
  }
  return objs;
}

function createRandomObject(color) {
  const canvas = getCanvas();
  const radius = Random.randomMinMax(options.minRadius, options.maxRadius);
  const size = 2 * radius;
  const halfWidth = canvas.width * 0.5;
  const halfHeight = canvas.height * 0.5;
  const x = Random.randomMinMax(-halfWidth + size, halfWidth - size);
  const y = Random.randomMinMax(-halfHeight + size, halfHeight - size);
  const velocity = Random.randomPointInCircle(options.minSpeed, options.maxSpeed);
  return createObject(x, y, radius, color, velocity, getNextId());
}

function createObject(x, y, radius, color, velocity, id) {
  const size = 2 * radius;
  return {
    x: x,
    y: y,
    width: size,
    height: size,
    color: color,
    radius: radius,
    velocity: velocity,
    id: id
  };
}

function updateObjectPositions(objects, deltaTime, bounds) {
  const count = objects.length;
  for (let i = 0; i < count; ++i) {
    const obj = objects[i];
    obj.x += obj.velocity.x * deltaTime;
    obj.y += obj.velocity.y * deltaTime;

    const radius = obj.radius;
    if (obj.x <= bounds.left + radius && obj.velocity.x < 0 || obj.x >= bounds.right - radius && obj.velocity.x > 0) {
      obj.velocity.x *= -1;
    }
    if (obj.x < bounds.left + radius) {
      obj.x = bounds.left + radius;
    } else if (obj.x > bounds.right - radius) {
      obj.x = bounds.right - radius;
    }
    if (obj.y <= bounds.bottom + radius && obj.velocity.y < 0 || obj.y >= bounds.top - radius && obj.velocity.y > 0) {
      obj.velocity.y *= -1;
    }
    if (obj.y < bounds.bottom + radius) {
      obj.y = bounds.bottom + radius;
    } else if (obj.y > bounds.top - radius) {
      obj.y = bounds.top - radius;
    }
  }
}

function detectCollisions(canvas, context, objects) {
  let numTotalCandidates = 0;
  let numTotalCollisions = 0;
  const candidates = [];
  const count = objects.length;
  for (let i = 0; i < count; ++i) {
    const obj = objects[i];
    candidates.length = 0;
    grid.findCandidates(obj, candidates);
    const numCandidates = candidates.length;
    numTotalCandidates += numCandidates;
    for (let k = 0; k < numCandidates; ++k) {
      const candidate = candidates[k];
      if (obj.id !== candidate.id) {
        if (testCollisionBetweenObjects(obj, candidate)) {
          if (options.highlightCollisions) {
            drawObject(canvas, context, obj, options.collisionColor, true);
          }
          numTotalCollisions += 1;
        }
      }
    }
  }
  return { candidates: numTotalCandidates, collisions: numTotalCollisions };
}

function detectCollisionsBruteForce(canvas, context, objects) {
  let numTotalCandidates = 0;
  let numTotalCollisions = 0;
  const count = objects.length;
  for (let i = 0; i < count-1; ++i) {
    for (let j = i+1; j < count; ++j) {
      if (objects[i].id !== objects[j].id) {
        numTotalCandidates += 1;
        if (testCollisionBetweenObjects(objects[i], objects[j])) {
          if (options.highlightCollisions) {
            drawObject(canvas, context, objects[i], options.collisionColor, true);
            drawObject(canvas, context, objects[j], options.collisionColor, true);
          }
          numTotalCollisions += 2;
        }
      }
    }
  }
  return { candidates: numTotalCandidates, collisions: numTotalCollisions };
}

function testCollisionBetweenObjects(lhs, rhs) {
  const dx = lhs.x - rhs.x;
  const dy = lhs.y - rhs.y;
  const radii = lhs.radius + rhs.radius;
  return (dx ** 2 + dy ** 2 < radii ** 2);
}

function drawObjects(canvas, context, objects, color, fill) {
  const count = objects.length;
  for (let i = 0; i < count; ++i) {
    const obj = objects[i];
    const pos = convertCartesianToCanvasCoordinates(canvas, obj.x, obj.y);
    CanvasRenderer.drawCircle(context, pos.x, pos.y, obj.radius, color || options.objectColor, fill);
  }
}

function drawObject(canvas, context, obj, color, fill) {
  const pos = convertCartesianToCanvasCoordinates(canvas, obj.x, obj.y);
  CanvasRenderer.drawCircle(context, pos.x, pos.y, obj.radius, color, fill);
}

function setObjectRadius(obj, radius) {
  obj.radius = radius;
  obj.width = obj.height = 2 * radius;
}

function setObjectsMinRadius(minRadius) {
  const count = objects.length;
  for (let i = 0; i < count; ++i) {
    if (objects[i].radius < minRadius) {
      setObjectRadius(objects[i], minRadius);
    }
  }
}

function setObjectsMaxRadius(maxRadius) {
  const count = objects.length;
  for (let i = 0; i < count; ++i) {
    if (objects[i].radius > maxRadius) {
      setObjectRadius(objects[i], maxRadius);
    }
  }
}

function setObjectsMinSpeed(minSpeed) {
  const count = objects.length;
  const sqrSpeed = minSpeed ** 2;
  for (let i = 0; i < count; ++i) {
    if (Vector2.sqrMagnitude(objects[i].velocity) < sqrSpeed) {
      const dir = Vector2.normalized(objects[i].velocity);
      objects[i].velocity = Vector2.scaled(dir, minSpeed);
    }
  }
}

function setObjectsMaxSpeed(maxSpeed) {
  const count = objects.length;
  const sqrSpeed = maxSpeed ** 2;
  for (let i = 0; i < count; ++i) {
    if (Vector2.sqrMagnitude(objects[i].velocity) > sqrSpeed) {
      const dir = Vector2.normalized(objects[i].velocity);
      objects[i].velocity = Vector2.scaled(dir, maxSpeed);
    }
  }
}

function createSpatialHash() {
  return new SpatialHash(options.cellSize, options.deleteEmptyBuckets);
}

function rebuildSpatialHash() {
  if (gridDirty) {
    gridDirty = false;
    grid = createSpatialHash();
  }
  grid.clear();
  const count = objects.length;
  for (let i = 0; i < count; ++i) {
    grid.insert(objects[i]);
  }
}

function convertCartesianToCanvasCoordinates(canvas, x, y) {
  const xx = x + canvasOriginOffset.x;
  const yy = canvas.height - (y + canvasOriginOffset.y);
  return { x: xx, y: yy };
}

function getCanvas() {
  return document.getElementById('canvas');
}

function setCanvasBackgroundColor(value) {
  const canvas = getCanvas();
  canvas.style.backgroundColor = value;
}

function getNextId() {
  return nextId++;
}
