# SpatialHash-js

This is yet another spatial hash implementation in JavaScript.

A spatial hash is a data structure which subdivides space into buckets of grid shape. It can be used to help to reduce the number of pair-wise comparisons in a (2d) scene in order find potential collision candidates.

## How to use

Creating a SpatialHash instance works as follows. The constructor expects two parameters. The first parameter, cellSize, is the size of a grid cell given as the n-th power of two, which means if you want a cell with the size 64 (64x64 units), then the value of cellSize is 6, as 2^6=64. The second parameter, deleteEmptyBuckets, is optional (default=true). So by default, empty buckets will be deleted when they don't contain objects any more.
<pre>
const cellSizeNthPowerOfTwo = 6;
const deleteEmptyBuckets = false;
let grid = new SpatialHash(cellSizeNthPowerOfTwo, deleteEmptyBuckets);
</pre>

Inserting an object into the SpatialHash.
<pre>
grid.insert({
  x: 43,
  y: 21,
  width: 13,
  height: 8
});
</pre>

Retrieving potential candidates from the SpatialHash.
<pre>
let candidates = [];
let rect = { x: 16, y: 16, width: 96, height: 96 };
grid.findCandidates(rect, candidates);
</pre>

Clearing the SpatialHash.
<pre>
grid.clear();
</pre>

Rebuilding the SpatialHash. The following method re-inserts all objects into the hash map.
<pre>
grid.rebuild();
</pre>

Happy coding!

## External links:
[Spatial Hashing](https://www.gamedev.net/resources/_/technical/game-programming/spatial-hashing-r2697)
