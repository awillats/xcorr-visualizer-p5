[[ ]] connect UI to synaptic weights
  (! ) noise levels
    ( ) gaussian - simple to specify 
    ( ) noise timescales? Perlin as special case?
  ( ) weights
  ( ) delays
    - implementation of delay doesnt seem to work with non-uniform scaling?
    (x) prove to myself delay impacts the shape of xcorr,
      at least in non-reciprocal circuits
  !? would be nice to overlay control directly on the xcorr!

[~] compute cross-correlation
  [x] port numpy's other convolution modes to numjs
  [~] plot xcorr (as a function of lags)
    [[~]] plot all xcorr
      - excise demo code (to demo.js?) to make room for xcorr matrix 
      - increase buffer length
  ( ) plot fixed-lag xcorr
    ( )  add scatterplot to plotFunctions.js
  (!) normalize cross-corr by autocorr
    - plot both normalizations!
    - timeflip as needed


[~] generate strucutral network model 
  [~] topological sorted weight matrix
    don't need topo sort if previous state is used for update
  [x] reciprocal conncections can work!  
  (?) figure out adj mat convention from circuit visualizer 
  ( ) memoize unstable circuits? by saving flag for largest values per circuit
  ( ) add textbox interface

[~] generate signal buffers
  [~] sketch out containers for signals 
  ( ) get sub buffer / view 
	( ) figure out how `circuit-viz` does it

[~] sketch out GUI elements
  - see google photos
  - container for 2D slider
    - (~) refactor slider as extension of node
    - (~) add additional linear slider

[~] add edittable params
  [x] constrained draggable points
  - fix step increment based on value *not* pixel coordinate
  [ ] use meteor to plot history of parameter
 
[x] add noise modes
  - ( ) add selector
  - ( ) look for qualitative differences
  - [x] perlin
  - [x] gaussian
  - [x] (sum of) Poisson


[x] import basic processing sketch structure
	[x] set folders, helper scripts

--- completed

[x] add frozen-vs-buffering
[~] import drawWave, Points.js
  - requires gh-pages .io link to act as content-delivery-network
---

( ) think about theme 
	(~) make sure variables are CSS stylable
 


