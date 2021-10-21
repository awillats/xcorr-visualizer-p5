[[ ]] connect UI to parameters
  (~) noise levels
    (~) gaussian - simple to specify 
    (~) can I easily swap out noise models???
      (~) main difficulty is having some sense of scale consistent across modes
          (x) write a set_variance() method for each generator
          (-) do we need a different set of slider limits depending on the type? 
            lambda = 5.0 is much bigger than sigma=5.0 ??
        - gaussian: sigma
        - poisson: lambda 
        - multi-poisson: lambda, ( n=100 )
        - perlin: y-scale
      (~) what keys to use? menu box?
      [ ] cycle through noise models rather than picking at random
  [[ ]] buffer length modification
    - may want separate xcorr buffer vs param buffer?
  [[ ]] clear xcorr buffer on paramter change?
      [ ] or on key press?
  ( ) weights
  ( ) delays
    - implementation of delay doesnt seem to work with non-uniform scaling?
    (x) prove to myself delay impacts the shape of xcorr,
      at least in non-reciprocal circuits
  🔊 [! !] perhaps want to be able to specify the *output* noise level?
     - or even, variance of signal AND noise
     - see /slides/ for explict prediction of output noise level, ID-SNR

  *to see the impact of params:*
    - 📅 [? ?] show history of xcorr w.r.t buffer length to give a sense of identifiability 
  ! ? would be nice to overlay control directly on the xcorr!


~~~~~~~~~

is there any way to visualize contributions?
- color mixing model?
- plot components?

(? ?) how to measure, export results (so this can be useful quantitatively)


~~~~~~~~~~

[~] XCORR - {compute, normalize, plot}
  ( ) highlight causal lags  
  (! !) quantify instantaneous identifiability
    - coincidence index

  [x] port numpy's other convolution modes to numjs
  [~] plot xcorr (as a function of lags)
    [~] plot all xcorr
      - excise demo code (to demo.js?) to make room for xcorr matrix 
      - increase buffer length
  ( ) plot fixed-lag xcorr
    ( )  add scatterplot to plotFunctions.js
  (!) normalize cross-corr by autocorr
    - plot both normalizations!
    - timeflip as needed

[~] generate strucutral network model 
  ( ) add textbox interface
  ( ) memoize unstable circuits? by saving flag for largest values per circuit
  [~] topological sorted weight matrix
    don't need topo sort if previous state is used for update
  [x] reciprocal conncections can work!  
  (?) figure out adj mat convention from circuit visualizer 

[~] generate signal buffers
  ( ) get sub buffer / view 
  [~] sketch out containers for signals 
	( ) figure out how `circuit-viz` does it


[~] add edittable params
  [ ] use meteor to plot history of parameter
  [x] constrained draggable points
  - fix step increment based on value *not* pixel coordinate
 
[x] add noise modes
  - ( ) look for qualitative differences
  - (~) add selector
  - [x] perlin
  - [x] gaussian
  - [x] (sum of) Poisson


[x] import basic processing sketch structure
	[x] set folders, helper scripts

--- completed

[~] sketch out GUI elements
  - see google photos
  - container for 2D slider
    - (~) refactor slider as extension of node
    - (~) add additional linear slider

[~] publish & polish
  [x] get gh-pages up
    - enable setting at github, done!
  [~] add basic user guidance
    (~) start with shortcuts panel
      - minimum viable product for this is an explainer paragraph at the bottom
    [~] [mr droob's showcase](https://mrdoob.com/#/112/branching) as inspiration
      he just uses simple text prompt

implementaiton notes:
  [x] getValue is based on mouse OR unconstrained coordinates!
    now force position constraint before getting value
[x] add frozen-vs-buffering
[~] import drawWave, Points.js
  - requires gh-pages .io link to act as content-delivery-network
---

( ) think about theme 
	(~) make sure variables are CSS stylable
 


