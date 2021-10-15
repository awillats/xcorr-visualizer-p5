[~] generate strucutral network model 
  [~] topological sorted weight matrix
    don't need topo sort if previous state is used for update
  [x] reciprocal conncections can work!  
  (?) figure out adj mat convention from circuit visualizer 

[ ] compute cross-correlation
  [x] port numpy's other convolution modes to numjs
  [ ] plot xcorr (as a function of lags)
  ( ) plot fixed-lag xcorr
    ( )  add scatterplot to plotFunctions.js
  ( ) normalize cross-corr by autocorr


[ ] connect UI to synaptic weights
  ( ) delays
  ( ) noise levels
    ( ) noise timescales? Perlin as special case?

[~] generate signal buffers
  [~] sketch out containers for signals 
	( ) figure out how `circuit-viz` does it

[x] plot any signal 

[.] sketch out GUI elements
  - container for 2D slider
    - (~) refactor slider as extension of node
    - (~) add additional linear slider

[~] import drawWave, Points.js
  - requires gh-pages .io link to act as content-delivery-network
[~] add edittable params
  [x] constrained draggable points
  - fix step increment based on value *not* pixel coordinate
  [ ] use meteor to plot history of parameter
 


[x] add noise modes
  - [x] perlin
  - [x] gaussian
  - [x] (sum of) Poisson
[x] add frozen-vs-buffering

[x] import basic processing sketch structure
	[x] set folders, helper scripts

---

( ) think about theme 
	(~) make sure variables are CSS stylable
 


